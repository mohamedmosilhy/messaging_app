"use client";

import { cn } from "@/app/lib/utils";
import { useRealtimeStatus } from "./RealtimeProvider";

const labels = {
  disconnected: "Real-time unavailable",
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  offline: "Offline",
} as const;

export function RealtimeStatus() {
  const status = useRealtimeStatus();

  return (
    <span
      className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      role="status"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-muted-foreground",
          status === "connected" && "bg-emerald-400",
          (status === "connecting" || status === "reconnecting") &&
            "animate-pulse bg-amber-400",
          status === "offline" && "bg-destructive",
        )}
      />
      {labels[status]}
    </span>
  );
}
