"use client";

import { ErrorState } from "@/app/components/shared/error-state";

export default function ProtectedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState onRetry={reset} />
    </div>
  );
}
