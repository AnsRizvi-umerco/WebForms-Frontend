

import { useState } from "react";
import { apiRoutes, http } from "@/api";
import { useToast } from "@/components/umerco/toast";
import { extractApiError, isApiSuccess } from "@/lib/api-error";

function getSubmitSuccessMessage(body: unknown): string {
  if (body && typeof body === "object" && "messageType" in body) {
    const messageType = String((body as { messageType?: string }).messageType ?? "").trim();
    if (messageType) {
      return `${messageType} submitted successfully.`;
    }
  }
  return "Document submitted successfully.";
}

export function useDocumentSubmit() {
  const { success, error } = useToast();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [lastRequest, setLastRequest] = useState<unknown>(null);

  const submit = async (body: unknown) => {
    setLastRequest(body);
    setPending(true);
    try {
      const res = await http.post(apiRoutes.submissions.submit, JSON.stringify(body), {
        headers: { "Content-Type": "text/plain" }
      });

      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      setResult(data);

      if (res.ok && isApiSuccess(data)) {
        success(getSubmitSuccessMessage(body));
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
