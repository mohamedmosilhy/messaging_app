"use client";

import { ArrowUpRight, LoaderCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import { openConversationRequest } from "@/app/features/messaging/actions/openConversationRequest";
import { getConversationUrl } from "@/app/utils/getConversationUrl";
import type { PublicProfile } from "../types/search-user.types";

export function UserSearchResult({ user }: { user: PublicProfile }) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string>();

  async function openConversation() {
    if (isOpening) return;

    try {
      setIsOpening(true);
      setError(undefined);
      const result = await openConversationRequest(user.id);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(getConversationUrl(result.data.conversationId));
    } catch {
      setError("Could not open this conversation.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <li className="group rounded-2xl border border-transparent p-3 transition-colors hover:border-white/8 hover:bg-white/[0.035]">
      <div className="flex items-center gap-3">
        <UserAvatar
          className="size-12 ring-1 ring-white/10"
          name={user.displayName || user.username}
          src={user.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {user.displayName || user.username}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{user.username}
          </p>
          {user.bio ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
              {user.bio}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label={`View ${user.displayName}'s profile`}
            asChild
            size="icon"
            variant="ghost"
          >
            <Link href={`/users/${user.username}`}>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            aria-label={`Message ${user.displayName}`}
            disabled={isOpening}
            onClick={openConversation}
            size="icon"
          >
            {isOpening ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <MessageCircle aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="mt-2 pl-15 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
