"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { ErrorState } from "@/app/components/shared/error-state";
import { getConversationRequest } from "../actions/getConversationRequest";
import { useConversationMessages } from "../hooks/useConversationMessages";
import { useSendMessage } from "../hooks/useSendMessage";
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
  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationRequest(conversationId),
  });
  const messagesQuery = useConversationMessages(conversationId);
  const messageMutation = useSendMessage(conversationId);

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
      />
      <MessageComposer
        errorMessage={messageMutation.error?.message}
        isPending={messageMutation.isPending}
        key={conversationId}
        onSend={(content, onSuccess) =>
          messageMutation.sendMessage(content, { onSuccess })
        }
      />
    </section>
  );
}
