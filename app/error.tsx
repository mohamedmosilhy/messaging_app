"use client";

import { ErrorState } from "@/app/components/shared/error-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <ErrorState onRetry={reset} />
    </main>
  );
}
