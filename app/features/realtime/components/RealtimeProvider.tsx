"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { GetConversationsResponse } from "@/app/features/messaging/types/conversation.types";
import type { GetMessagesResponse } from "@/app/features/messaging/types/messages.types";
import type { RealtimeEventEnvelope } from "../types/realtime.types";
import { fromRealtimeMessage } from "../types/realtime.types";
import {
  applyReadEventToInbox,
  mergeMessageIntoCache,
  mergeMessageIntoInbox,
} from "../utils/realtime-cache";

export type RealtimeConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

const RealtimeContext = createContext<RealtimeConnectionStatus>("disconnected");

function getActiveConversationId(pathname: string) {
  const match = pathname.match(/^\/dashboard\/conversations\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const activeConversationId = getActiveConversationId(pathname);
  const [status, setStatus] =
    useState<RealtimeConnectionStatus>("disconnected");
  const seenEventIds = useRef(new Set<string>());

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user.id) {
      return;
    }

    const since = new Date(Date.now() - 5_000).toISOString();
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;
    let lastEventId: string | undefined;
    let stopped = false;
    const reconcile = () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["conversation"] });
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    const handleOnline = () => {
      setStatus("reconnecting");
      if (!source && !retryTimer) connect();
    };
    const handleOffline = () => setStatus("offline");

    const handleEvent = (rawEvent: Event) => {
      let parsedEvent: unknown;

      try {
        parsedEvent = JSON.parse((rawEvent as MessageEvent<string>).data);
      } catch {
        return;
      }

      if (
        !parsedEvent ||
        typeof parsedEvent !== "object" ||
        !("version" in parsedEvent) ||
        !("eventId" in parsedEvent) ||
        parsedEvent.version !== 1 ||
        typeof parsedEvent.eventId !== "string"
      ) {
        return;
      }

      const event = parsedEvent as RealtimeEventEnvelope;

      if (seenEventIds.current.has(event.eventId)) {
        return;
      }

      seenEventIds.current.add(event.eventId);
      lastEventId = event.eventId;
      if (seenEventIds.current.size > 500) {
        const oldestEventId = seenEventIds.current.values().next().value;
        if (oldestEventId) seenEventIds.current.delete(oldestEventId);
      }

      if (event.type === "message.created") {
        const message = fromRealtimeMessage(event.data.message);

        queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(
          ["messages", message.conversationId],
          (oldData) => mergeMessageIntoCache(oldData, message),
        );
        queryClient.setQueryData<GetConversationsResponse>(
          ["conversations"],
          (oldData) =>
            mergeMessageIntoInbox(oldData, message, {
              currentUserId: session.user.id,
              activeConversationId,
            }),
        );
      } else if (
        event.type === "conversation.read" &&
        event.data.userId === session.user.id
      ) {
        queryClient.setQueryData<GetConversationsResponse>(
          ["conversations"],
          (oldData) => applyReadEventToInbox(oldData, event.data),
        );
      }

      if (
        event.type === "message.created" ||
        event.type === "conversation.read"
      ) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    function connect() {
      if (stopped || !navigator.onLine) {
        setStatus("offline");
        return;
      }

      const query = lastEventId
        ? `lastEventId=${encodeURIComponent(lastEventId)}`
        : `since=${encodeURIComponent(since)}`;
      source = new EventSource(`/api/realtime?${query}`);

      source.onopen = () => {
        reconnectAttempt = 0;
        setStatus("connected");
        reconcile();
      };
      source.onerror = () => {
        source?.close();
        source = null;

        if (stopped) return;

        if (!navigator.onLine) {
          setStatus("offline");
          return;
        }

        setStatus("reconnecting");
        const backoff = Math.min(30_000, 1_000 * 2 ** reconnectAttempt);
        const jitter = Math.floor(Math.random() * Math.max(1, backoff * 0.25));
        reconnectAttempt += 1;
        retryTimer = setTimeout(() => {
          retryTimer = null;
          connect();
        }, backoff + jitter);
      };
      source.addEventListener("relay", handleEvent);
    }

    connect();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      stopped = true;
      source?.close();
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [activeConversationId, queryClient, session?.user.id, sessionStatus]);

  const value = useMemo<RealtimeConnectionStatus>(() => {
    if (sessionStatus !== "authenticated") return "disconnected";
    return status === "disconnected" ? "connecting" : status;
  }, [sessionStatus, status]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
