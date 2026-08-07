import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import type { GetConversationsResponse } from "@/app/features/messaging/types/conversation.types";
import { markConversationReadRequest } from "../actions/markConversationReadRequest";
import { applyReadEventToInbox } from "../utils/realtime-cache";

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();
  const lastSubmittedMessageId = useRef<string | null>(null);
  const mutation = useMutation({
    mutationFn: (messageId: string) =>
      markConversationReadRequest({ conversationId, messageId }),
    onSuccess: (response) => {
      queryClient.setQueryData<GetConversationsResponse>(
        ["conversations"],
        (oldData) =>
          applyReadEventToInbox(oldData, {
            conversationId,
            lastReadMessageId: response.data.lastReadMessageId,
            unreadCount: response.data.unreadCount,
          }),
      );
    },
  });

  useEffect(() => {
    lastSubmittedMessageId.current = null;
  }, [conversationId]);

  const markRead = useCallback(
    (messageId: string) => {
      if (
        document.visibilityState !== "visible" ||
        lastSubmittedMessageId.current === messageId
      ) {
        return;
      }

      lastSubmittedMessageId.current = messageId;
      mutation.mutate(messageId, {
        onError: () => {
          if (lastSubmittedMessageId.current === messageId) {
            lastSubmittedMessageId.current = null;
          }
        },
      });
    },
    [mutation],
  );

  return { markRead };
}
