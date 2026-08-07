import { Info } from "lucide-react";
import Link from "next/link";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import { BlockUserButton } from "@/app/features/blocking/components/BlockUserButton";
import { RealtimeStatus } from "@/app/features/realtime";
import type { GetConversationResponse } from "../types/conversation.types";
import { MobileConversationHeader } from "./MobileConversationHeader";

type ConversationHeaderProps = {
  conversation: GetConversationResponse["data"];
};

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const participant = conversation.participants[0];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/8 bg-card/65 px-3 backdrop-blur-xl md:px-4">
      <MobileConversationHeader />
      <UserAvatar
        className="size-10 ring-1 ring-white/10"
        name={conversation.title}
        src={conversation.avatarUrl}
      />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">{conversation.title}</h1>
        <p className="truncate text-xs text-muted-foreground">
          {participant ? `@${participant.username}` : "Direct conversation"}
        </p>
      </div>
      <div className="hidden sm:flex md:hidden">
        <RealtimeStatus />
      </div>
      {participant ? (
        <div className="flex items-center gap-1">
          <BlockUserButton
            compact
            displayName={conversation.title}
            targetUserId={participant.id}
          />
          <Button
            aria-label={`View ${conversation.title}'s profile`}
            asChild
            size="icon"
            variant="ghost"
          >
            <Link href={`/users/${participant.username}`}>
              <Info aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : null}
    </header>
  );
}
