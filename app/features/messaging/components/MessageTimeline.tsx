"use client";

import { AlertCircle, ArrowDown, LoaderCircle } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/app/components/ui/button";
import type { MessageResponse } from "../types/messages.types";
import { formatMessageDate, getDateKey } from "../utils/message-formatters";
import { DateSeparator } from "./DateSeparator";
import { MessageBubble } from "./MessageBubble";

const BOTTOM_THRESHOLD = 120;
const GROUP_WINDOW_MS = 5 * 60 * 1000;

type MessageTimelineProps = {
  currentUserId?: string;
  messages: MessageResponse[];
  hasNextPage: boolean;
  isLoadOlderError: boolean;
  isFetchingNextPage: boolean;
  onLoadOlder: () => Promise<unknown>;
};

function messagesAreGrouped(
  first: MessageResponse | undefined,
  second: MessageResponse | undefined,
) {
  if (!first || !second || first.senderId !== second.senderId) {
    return false;
  }

  const firstTime = new Date(first.createdAt).getTime();
  const secondTime = new Date(second.createdAt).getTime();

  return (
    getDateKey(first.createdAt) === getDateKey(second.createdAt) &&
    Math.abs(secondTime - firstTime) <= GROUP_WINDOW_MS
  );
}

export function MessageTimeline({
  currentUserId,
  messages,
  hasNextPage,
  isLoadOlderError,
  isFetchingNextPage,
  onLoadOlder,
}: MessageTimelineProps) {
  const latestMessageId = messages.at(-1)?.id;
  const viewportRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const previousLastMessageIdRef = useRef(latestMessageId);
  const anchorHeightRef = useRef<number | null>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;

    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    }
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || initializedRef.current || messages.length === 0) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
    initializedRef.current = true;
    previousLastMessageIdRef.current = latestMessageId;
  }, [latestMessageId, messages.length]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const anchorHeight = anchorHeightRef.current;

    if (!viewport || anchorHeight === null || isFetchingNextPage) {
      return;
    }

    viewport.scrollTop += viewport.scrollHeight - anchorHeight;
    anchorHeightRef.current = null;
  }, [isFetchingNextPage, messages.length]);

  useEffect(() => {
    const latestMessage = messages.at(-1);
    const hasOwnNewMessage =
      latestMessage?.id !== previousLastMessageIdRef.current &&
      latestMessage?.senderId === currentUserId;

    if (initializedRef.current && hasOwnNewMessage) {
      scrollToBottom();
    }

    previousLastMessageIdRef.current = latestMessage?.id;
  }, [currentUserId, messages, scrollToBottom]);

  async function loadOlderMessages() {
    const viewport = viewportRef.current;

    if (viewport) {
      anchorHeightRef.current = viewport.scrollHeight;
    }

    try {
      await onLoadOlder();
    } catch {
      anchorHeightRef.current = null;
    }
  }

  function handleScroll() {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setShowJumpButton(distanceFromBottom > BOTTOM_THRESHOLD);
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        aria-label="Message history"
        className="h-full overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
        onScroll={handleScroll}
        ref={viewportRef}
        role="log"
      >
        {hasNextPage ? (
          <div className="flex flex-col items-center gap-2 pb-3">
            {isLoadOlderError ? (
              <p
                className="flex items-center gap-1.5 text-xs text-destructive"
                role="alert"
              >
                <AlertCircle aria-hidden="true" className="size-3.5" />
                Older messages could not be loaded.
              </p>
            ) : null}
            <Button
              disabled={isFetchingNextPage}
              onClick={loadOlderMessages}
              size="sm"
              variant="outline"
            >
              {isFetchingNextPage ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              {isFetchingNextPage
                ? "Loading older messages"
                : isLoadOlderError
                  ? "Retry older messages"
                  : "Load older"}
            </Button>
          </div>
        ) : messages.length > 0 ? (
          <p className="pb-2 text-center text-xs text-muted-foreground">
            This is the beginning of your conversation.
          </p>
        ) : null}

        {messages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center pb-16">
            <div className="max-w-sm rounded-2xl border bg-card px-5 py-4 text-center shadow-xs">
              <p className="font-medium">No messages yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the first message to start this conversation.
              </p>
            </div>
          </div>
        ) : (
          <ul aria-label="Messages">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const startsGroup = !messagesAreGrouped(previous, message);
              const endsGroup = !messagesAreGrouped(message, next);
              const startsDate =
                !previous ||
                getDateKey(previous.createdAt) !==
                  getDateKey(message.createdAt);

              return (
                <Fragment key={message.id}>
                  {startsDate ? (
                    <DateSeparator
                      label={formatMessageDate(message.createdAt)}
                    />
                  ) : null}
                  <MessageBubble
                    endsGroup={endsGroup}
                    isMine={message.senderId === currentUserId}
                    message={message}
                    startsGroup={startsGroup}
                  />
                </Fragment>
              );
            })}
          </ul>
        )}
      </div>

      {showJumpButton ? (
        <Button
          aria-label="Jump to latest message"
          className="absolute right-4 bottom-4 rounded-full shadow-md"
          onClick={() => scrollToBottom()}
          size="icon"
          variant="secondary"
        >
          <ArrowDown aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
