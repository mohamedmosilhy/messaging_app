"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { ErrorState } from "@/app/components/shared/error-state";
import { getConversationRequest } from "../actions/getConversationRequest";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import type { GetConversationsResponse } from "../types/conversation.types";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationSkeleton } from "./ConversationSkeleton";
import { MessageComposer } from "./MessageComposer";
import { MessageTimeline } from "./MessageTimeline";

export function ConversationContent({
  conversationId,
}: {
  conversationId: string;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationRequest(conversationId),
  });
  const messagesQuery = useConversationMessages(conversationId);
  const messageMutation = useSendMessage(conversationId);

  useEffect(() => {
    queryClient.setQueryData<GetConversationsResponse>(
      ["conversations"],
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            conversations: oldData.data.conversations.map((conversation) =>
              conversation.conversationId === conversationId
                ? { ...conversation, unreadCount: 0 }
                : conversation,
            ),
          },
        };
      },
    );
  }, [conversationId, conversationQuery.data, queryClient]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <ConversationSkeleton />;
  }

  if (conversationQuery.isError || messagesQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState
          description="The conversation could not be loaded. Check your connection and try again."
          onRetry={() => {
            void conversationQuery.refetch();
            void messagesQuery.refetch();
          }}
          title="Could not load this conversation"
        />
      </div>
    );
  }

  if (!conversationQuery.data) {
    return null;
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <ConversationHeader conversation={conversationQuery.data.data} />
      <MessageTimeline
        currentUserId={session?.user?.id}
        hasNextPage={messagesQuery.hasNextPage}
        isFetchingNextPage={messagesQuery.isFetchingNextPage}
        isLoadOlderError={messagesQuery.isFetchNextPageError}
        messages={messagesQuery.messages}
        onLoadOlder={messagesQuery.fetchNextPage}
        onRemoveMessage={messageMutation.removeFailedMessage}
        onRetryMessage={messageMutation.retryMessage}
      />
      <MessageComposer
        conversationId={conversationId}
        key={conversationId}
        onSend={messageMutation.sendMessage}
      />
    </section>
  );
}
