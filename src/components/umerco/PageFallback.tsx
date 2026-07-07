import { LoadingBlock } from "@/components/umerco/LoadingBlock";

export function PageFallback({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-9.5rem)] w-full max-w-6xl items-center justify-center px-8">
      <LoadingBlock message={message} size="md" />
    </div>
  );
}
