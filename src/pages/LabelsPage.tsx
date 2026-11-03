import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { apiRoutes, http } from "@/api";
import { Code39Barcode } from "@/lib/code39-barcode";
import { downloadShippingLabelPdf } from "@/lib/shipping-label-pdf";
import { extractApiError } from "@/lib/api-error";
import { PageFallback } from "@/components/umerco/PageFallback";
import { btnOutline, btnPrimary, card } from "@/components/umerco/styles";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";
import { useToast } from "@/components/umerco/toast";

type ShippingLabel = {
  id: string;
  asnRef: string;
  poNumber: string;
  trackingNo: string;
  shipToName: string;
  shipToLines: string[];
  shipFromName: string;
  shipFromLines: string[];
  weight: string;
  dimensions: string;
  shipDate: string;
  remarks: string;
  barcode: string;
  zpl: string;
  createdAt: string;
};

type LabelsResponse = {
  labels?: ShippingLabel[];
  error?: string;
};

function ShippingLabelCard({
  label,
  onDownloadPdf
}: {
  label: ShippingLabel;
  onDownloadPdf: (label: ShippingLabel) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          className={`${btnOutline} gap-2 text-xs`}
          onClick={() => onDownloadPdf(label)}
        >
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Download PDF
        </button>
      </div>
      <article className="shipping-label overflow-hidden border-2 border-umerco-dark bg-white text-umerco-dark">
      <div className="grid grid-cols-2 border-b-2 border-umerco-dark">
        <div className="border-r-2 border-umerco-dark p-4">
          <span className="inline-flex rounded-md bg-umerco-dark px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Ship to:
          </span>
          <div className="mt-3 space-y-0.5 text-sm">
            {label.shipToLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-umerco-dark">From:</p>
          <div className="mt-3 space-y-0.5 text-sm">
            {label.shipFromLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-umerco-dark">
        <dl className="divide-y divide-umerco-border border-r-2 border-umerco-dark text-sm">
          <div className="grid grid-cols-[8.5rem_1fr] gap-2 px-4 py-2.5">
            <dt className="font-semibold uppercase tracking-wide text-umerco-muted">Order ID:</dt>
            <dd className="font-medium">{label.poNumber}</dd>
          </div>
          <div className="grid grid-cols-[8.5rem_1fr] gap-2 px-4 py-2.5">
            <dt className="font-semibold uppercase tracking-wide text-umerco-muted">Weight:</dt>
            <dd className="font-medium">{label.weight}</dd>
          </div>
          <div className="grid grid-cols-[8.5rem_1fr] gap-2 px-4 py-2.5">
            <dt className="font-semibold uppercase tracking-wide text-umerco-muted">Dimensions:</dt>
            <dd className="font-medium">{label.dimensions}</dd>
          </div>
          <div className="grid grid-cols-[8.5rem_1fr] gap-2 px-4 py-2.5">
            <dt className="font-semibold uppercase tracking-wide text-umerco-muted">Shipping Date:</dt>
            <dd className="font-medium">{label.shipDate}</dd>
          </div>
        </dl>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-umerco-dark">Remarks:</p>
          <p className="mt-3 text-sm font-medium uppercase">{label.remarks}</p>
          <p className="mt-4 text-xs text-umerco-muted">ASN {label.asnRef}</p>
        </div>
      </div>

      <div className="px-6 py-5">
        <Code39Barcode value={label.barcode} className="h-16 w-full" />
        <p className="mt-2 text-center font-mono text-sm tracking-[0.2em]">{label.barcode}</p>
      </div>
    </article>
    </div>
  );
}

export default function LabelsPage() {
  const { error: toastError } = useToast();
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    http
      .get(apiRoutes.labels, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as LabelsResponse;
        if (controller.signal.aborted) return;
        if (!response.ok) {
          const message = extractApiError(data, "Could not load shipping labels.");
          setError(message);
          toastError(message);
          return;
        }
        setLabels(data.labels ?? []);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = "Could not load shipping labels.";
        setError(message);
        toastError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [toastError]);

  const onPrintAll = () => window.print();
  const onDownloadPdf = (label: ShippingLabel) => {
    try {
      downloadShippingLabelPdf(label);
    } catch {
      toastError("Could not download this shipping label as PDF.");
    }
  };

  if (loading) {
    return <PageFallback message="Loading shipping labels…" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UmercoSectionLabel>Shipping Labels</UmercoSectionLabel>
          <h2 className="mt-1 text-2xl font-semibold text-umerco-dark">Shipping Labels</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-umerco-muted">
            Labels are created automatically when an ASN is submitted. Download a single label as PDF
            or print all labels.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${btnPrimary} gap-2`}
            onClick={onPrintAll}
            disabled={labels.length === 0}
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            Print All
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-umerco-muted">{error}</p>
      ) : labels.length === 0 ? (
        <div className={`${card} px-6 py-14 text-center`}>
          <p className="text-sm font-medium text-umerco-dark">No shipping labels yet</p>
          <p className="mt-1 text-sm text-umerco-muted">
            Submit an ASN from a delivery schedule and the label will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {labels.map((label) => (
            <ShippingLabelCard key={label.id} label={label} onDownloadPdf={onDownloadPdf} />
          ))}
        </div>
      )}
    </div>
  );
}
