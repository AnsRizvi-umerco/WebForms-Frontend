import { useEffect, useState } from "react";
import { card } from "@/components/umerco/styles";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";
import { useToast } from "@/components/umerco/toast";
import { extractApiError } from "@/lib/api-error";
import { apiRoutes, http } from "@/api";
import { LoadingBlock } from "@/components/umerco/LoadingBlock";

type EdifactRow = {
  id: string;
  edifact_string: string;
  received_at: string;
};

export default function EdifactPage() {
  const toast = useToast();
  const [rows, setRows] = useState<EdifactRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get(apiRoutes.edifact)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const message = extractApiError(data, "Could not load EDIFACT payloads.");
          setError(message);
          toast.error(message);
          return;
        }
        setRows(data.rows ?? []);
      })
      .catch(() => {
        const message = "Could not load EDIFACT payloads.";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <>
        <UmercoSectionLabel>EDIFACT</UmercoSectionLabel>
        <h2 className="mb-4 text-xl font-semibold text-umerco-dark">EDIFACT (IWHI)</h2>
        <div className={`${card} flex min-h-[12rem] items-center justify-center p-4`}>
          <LoadingBlock message="Loading EDIFACT…" size="sm" className="py-0" />
        </div>
      </>
    );
  }

  return (
    <>
      <UmercoSectionLabel>EDIFACT</UmercoSectionLabel>
      <h2 className="mb-4 text-xl font-semibold text-umerco-dark">EDIFACT (IWHI)</h2>
      {error ? <p className="mb-3 text-sm text-umerco-muted">{error}</p> : null}
      {!error && rows.length === 0 && (
        <p className="text-sm text-umerco-muted">No EDIFACT payloads received yet.</p>
      )}
      {!error && rows.length > 0 && (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li className={`${card} p-4`} key={row.id}>
              <p className="mb-2 text-xs text-umerco-muted">
                {new Date(row.received_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "medium"
                })}
              </p>
              <pre className="surface-dark max-h-[24rem] overflow-auto whitespace-pre-wrap break-words rounded p-3 font-mono text-xs">
                {row.edifact_string}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
