"use client";

import { Ban, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { useBlockingMutation, useBlockStatus } from "../hooks/useBlocking";
import type { BlockStatusResponse } from "../types/blocking.types";

type BlockUserButtonProps = {
  targetUserId: string;
  displayName: string;
  initialStatus?: BlockStatusResponse;
  compact?: boolean;
  className?: string;
};

export function BlockUserButton({
  targetUserId,
  displayName,
  initialStatus,
  compact = false,
  className,
}: BlockUserButtonProps) {
  const router = useRouter();
  const status = useBlockStatus(targetUserId, initialStatus);
  const mutation = useBlockingMutation(targetUserId);
  const isBlocked = status.data?.data.isBlockedByCurrentUser ?? false;

  async function toggleBlock() {
    if (!isBlocked) {
      const confirmed = window.confirm(
        `Block ${displayName}? You will no longer be able to find or message each other. Your existing conversation history will remain visible.`,
      );

      if (!confirmed) return;
    }

    try {
      await mutation.mutateAsync(!isBlocked);
      router.refresh();
    } catch {
      // React Query exposes the user-safe request error below the control.
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Button
        aria-label={
          compact
            ? `${isBlocked ? "Unblock" : "Block"} ${displayName}`
            : undefined
        }
        className={compact ? undefined : "rounded-xl"}
        disabled={status.isLoading || mutation.isPending}
        onClick={() => void toggleBlock()}
        size={compact ? "icon" : "default"}
        variant={isBlocked ? "outline" : "destructive"}
      >
        {mutation.isPending || status.isLoading ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : isBlocked ? (
          <ShieldCheck aria-hidden="true" />
        ) : (
          <Ban aria-hidden="true" />
        )}
        {compact ? null : isBlocked ? "Unblock" : "Block"}
      </Button>
      {mutation.error || status.error ? (
        <p className="max-w-56 text-xs text-destructive" role="alert">
          {(mutation.error ?? status.error)?.message ??
            "The blocking preference could not be updated."}
        </p>
      ) : null}
    </div>
  );
}
