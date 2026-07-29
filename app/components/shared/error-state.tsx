"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "The page could not be loaded. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
      {onRetry ? (
        <Button className="self-start" onClick={onRetry} variant="outline">
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
