"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { ConversationListItem } from "../types/conversation.types";

function formatConversationTime(value: Date | string | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ConversationListItemComponent({
  conversation,
}: {
  conversation: ConversationListItem;
}) {
  const pathname = usePathname();
  const href = `/dashboard/conversations/${conversation.conversationId}`;
  const isActive = pathname === href;

  return (
    <li>
      <Link
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          isActive && "bg-accent text-accent-foreground",
        )}
        href={href}
      >
        <UserAvatar
          className="size-11"
          name={conversation.title}
          src={conversation.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                conversation.unreadCount > 0 ? "font-semibold" : "font-medium",
              )}
            >
              {conversation.title}
            </p>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatConversationTime(conversation.lastMessageAt)}
            </time>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {conversation.lastMessage || "No messages yet"}
            </p>
            {conversation.unreadCount > 0 ? (
              <Badge
                className="min-w-5 justify-center px-1.5"
                variant="default"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
