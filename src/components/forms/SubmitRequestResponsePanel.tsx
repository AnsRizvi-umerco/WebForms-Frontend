

type Props = {
  lastRequest: unknown;
  result: unknown;
};

function showJsonBody(): boolean {
  const v = import.meta.env.VITE_SHOW_JSON?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function SubmitRequestResponsePanel({ lastRequest, result }: Props) {
  const showRequest = showJsonBody() && lastRequest != null;
  const showResponse = result != null;

  if (!showRequest && !showResponse) return null;

  const twoCols = showRequest && showResponse;

  return (
    <div className={twoCols ? "mt-4 grid gap-4 md:grid-cols-2" : "mt-4"}>
      {showRequest ? (
        <div>
          <p className="mb-1 umerco-section-label">Request body</p>
          <pre className="surface-dark max-h-96 overflow-auto rounded p-3 text-xs">
            {JSON.stringify(lastRequest)}
          </pre>
        </div>
      ) : null}
      {showResponse ? (
        <div>
          <p className="mb-1 umerco-section-label">Response</p>
          <pre className="surface-dark max-h-96 overflow-auto rounded p-3 text-xs">
            {JSON.stringify(result)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
