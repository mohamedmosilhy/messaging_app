import { Check, Clock3 } from "lucide-react";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import { cn } from "@/app/lib/utils";
import type { MessageResponse } from "../types/messages.types";
import { formatMessageTime } from "../utils/message-formatters";

type MessageBubbleProps = {
  message: MessageResponse;
  isMine: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
};

export function MessageBubble({
  message,
  isMine,
  startsGroup,
  endsGroup,
}: MessageBubbleProps) {
  return (
    <li
      className={cn(
        "flex items-end gap-2",
        isMine ? "justify-end" : "justify-start",
        startsGroup ? "mt-3" : "mt-1",
      )}
    >
      {!isMine ? (
        endsGroup ? (
          <UserAvatar
            className="size-7"
            name={message.sender.displayName}
            src={message.sender.avatarUrl}
          />
        ) : (
          <div aria-hidden="true" className="w-7 shrink-0" />
        )
      ) : null}
      <div
        className={cn(
          "max-w-[82%] px-3 py-2 text-sm shadow-xs sm:max-w-[70%] lg:max-w-[62%]",
          isMine
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground",
          isMine
            ? startsGroup
              ? "rounded-2xl rounded-tr-md"
              : "rounded-2xl rounded-r-md"
            : startsGroup
              ? "rounded-2xl rounded-tl-md"
              : "rounded-2xl rounded-l-md",
        )}
      >
        {!isMine && startsGroup ? (
          <p className="mb-1 text-xs font-semibold text-primary">
            {message.sender.displayName}
          </p>
        ) : null}
        <p className="wrap-anywhere whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[0.65rem]",
            isMine ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          <time dateTime={new Date(message.createdAt).toISOString()}>
            {formatMessageTime(message.createdAt)}
          </time>
          {isMine ? (
            message.isOptimistic ? (
              <>
                <Clock3 aria-hidden="true" className="size-3" />
                <span className="sr-only">Sending</span>
              </>
            ) : (
              <>
                <Check aria-hidden="true" className="size-3" />
                <span className="sr-only">Sent</span>
              </>
            )
          ) : null}
        </div>
      </div>
    </li>
  );
}
