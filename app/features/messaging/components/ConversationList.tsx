"use client";

import { MessageCircleDashed } from "lucide-react";

import { EmptyState } from "@/app/components/shared/empty-state";
import { ErrorState } from "@/app/components/shared/error-state";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useConversations } from "../hooks/useConversations";
import type { ConversationListItem } from "../types/conversation.types";
import ConversationListItemComponent from "./ConversationListItemComponent";

function ConversationListSkeleton() {
  return (
    <div aria-label="Loading conversations" className="space-y-1 p-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="flex items-center gap-3 p-2" key={index}>
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const ConversationList = () => {
  const { conversations, isLoading, error, isError } = useConversations();

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        description={error?.message || "The inbox could not be loaded."}
        title="Could not load conversations"
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          compact
          description="Start a new chat to create your first conversation."
          icon={MessageCircleDashed}
          title="No conversations yet"
        />
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {conversations.map((conversation: ConversationListItem) => (
        <ConversationListItemComponent
          conversation={conversation}
          key={conversation.conversationId}
        />
      ))}
    </ul>
  );
};
