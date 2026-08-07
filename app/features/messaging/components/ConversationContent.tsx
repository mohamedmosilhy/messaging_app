"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useBlockStatus } from "@/app/features/blocking/hooks/useBlocking";
import { useMarkConversationRead } from "@/app/features/realtime";

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
  const { markRead } = useMarkConversationRead(conversationId);
  const otherParticipantId = conversationQuery.data?.data.participants[0]?.id;
  const blockStatus = useBlockStatus(otherParticipantId);

  const handleLatestRead = useCallback(
    (messageId: string) => markRead(messageId),
    [markRead],
  );

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
        onLatestRead={handleLatestRead}
        onRemoveMessage={messageMutation.removeFailedMessage}
        onRetryMessage={messageMutation.retryMessage}
      />
      <MessageComposer
        conversationId={conversationId}
        disabled={
          Boolean(otherParticipantId) &&
          (blockStatus.isLoading ||
            blockStatus.data?.data.canInteract === false)
        }
        disabledReason={
          blockStatus.isLoading
            ? "Checking messaging availability…"
            : blockStatus.data?.data.canInteract === false
              ? "Messaging is unavailable while either account has blocked the other."
              : undefined
        }
        key={conversationId}
        onSend={messageMutation.sendMessage}
      />
    </section>
  );
}
