import { useState } from "react";
import { apiRoutes, http } from "@/api";
import { useToast } from "@/components/umerco/toast";
import { useAuth } from "@/context/auth-context";
import { extractApiError, isApiSuccess } from "@/lib/api-error";
import { ediCodesFromSession } from "@/lib/session-edi";
import { outboundDocumentLabel } from "@/lib/document-types";

function getSubmitSuccessMessage(body: unknown): string {
  if (body && typeof body === "object" && "messageType" in body) {
    const messageType = String((body as { messageType?: string }).messageType ?? "").trim().toUpperCase();
    if (messageType === "DESADV") {
      return "ASN submitted successfully. A shipping label was created in Shipping Labels.";
    }
    if (messageType) {
      return `${outboundDocumentLabel(messageType)} submitted successfully.`;
    }
  }
  return "Document submitted successfully.";
}

type SubmitResult = {
  success?: boolean;
  error?: string;
  channelRequest?: {
    body?: unknown;
  };
};

export function useDocumentSubmit() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [lastRequest, setLastRequest] = useState<unknown>(null);

  const submit = async (body: unknown) => {
    setPending(true);
    try {
      const edi = ediCodesFromSession(user);
      if (!edi.supplierCode) {
        throw new Error("Supplier Mutually Defined is missing from the signed-in session.");
      }
      if (!edi.tradingPartner) {
        throw new Error("Company Mutually Defined is missing from the signed-in session.");
      }

      const envelope =
        body && typeof body === "object"
          ? {
              ...(body as Record<string, unknown>),
              supplierCode: edi.supplierCode,
              tradingPartner: edi.tradingPartner
            }
          : body;

      const res = await http.post(apiRoutes.submissions.submit, envelope as Record<string, unknown>);

      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      const parsed = data as SubmitResult | null;
      const sentPayload =
        parsed?.channelRequest?.body ??
        (envelope && typeof envelope === "object" && "payload" in envelope
          ? (envelope as { payload?: unknown }).payload
          : envelope);
      setLastRequest(sentPayload);
      setResult(data);

      if (res.ok && isApiSuccess(data)) {
        success(getSubmitSuccessMessage(envelope));
      } else {
        error(extractApiError(data, `Submission failed (${res.status})`));
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      error(message);
      throw err;
    } finally {
      setPending(false);
    }
  };

  return { pending, result, lastRequest, submit };
}
