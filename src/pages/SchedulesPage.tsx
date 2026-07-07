import { lazy, Suspense } from "react";
import { LoadingBlock } from "@/components/umerco/LoadingBlock";

const SchedulesBoard = lazy(() =>
  import("@/components/schedules-board").then((module) => ({ default: module.SchedulesBoard }))
);

export default function SchedulesPage() {
  return (
    <Suspense
      fallback={
        <div className="relative mx-auto flex min-h-[calc(100dvh-9.5rem)] w-full max-w-6xl items-center justify-center px-8">
          <LoadingBlock message="Loading schedules…" size="md" />
        </div>
      }
    >
      <div className="mx-auto w-full max-w-6xl">
        <SchedulesBoard />
      </div>
    </Suspense>
  );
}
