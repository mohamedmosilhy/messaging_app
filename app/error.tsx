"use client";

import { ErrorState } from "@/app/components/shared/error-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-background"
      id="main-content"
      tabIndex={-1}
    >
      <ErrorState onRetry={reset} />
    </main>
  );
}
