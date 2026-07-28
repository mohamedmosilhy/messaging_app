import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { sendMessageRequest } from "../actions/sendMessageRequest";
import {
  GetMessagesResponse,
  MessageResponse,
  SendMessageResponse,
} from "../types/messages.types";
import {
  ConversationListItem,
  GetConversationsResponse,
} from "../types/conversation.types";

type SendMessageContext = {
  previousMessages?: InfiniteData<GetMessagesResponse>;
  temporaryMessageId?: string;
};

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const messagesQueryKey = ["messages", conversationId] as const;

  function updateMessages(
    oldData: InfiniteData<GetMessagesResponse> | undefined,
    updater: (messages: MessageResponse[]) => MessageResponse[],
  ) {
    if (!oldData) {
      return oldData;
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              data: {
                ...page.data,
                messages: updater(page.data.messages),
              },
            }
          : page,
      ),
    };
  }

  const mutation = useMutation<
    SendMessageResponse,
    Error,
    string,
    SendMessageContext
  >({
    mutationFn: (content: string) =>
      sendMessageRequest({
        conversationId,
        content,
      }),

    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: messagesQueryKey,
      });

      const previousMessages =
        queryClient.getQueryData<InfiniteData<GetMessagesResponse>>(
          messagesQueryKey,
        );

      if (!previousMessages || !session?.user) {
        return {};
      }

      const temporaryMessageId = `temp-${crypto.randomUUID()}`;

      const optimisticMessage: MessageResponse & { isOptimistic: true } = {
        id: temporaryMessageId,
        senderId: session.user.id,
        conversationId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: session.user.id,
          username: session.user.username,
          displayName: session.user.displayName,
          bio: session.user.bio,
          avatarUrl: session.user.avatarUrl,
        },
        isOptimistic: true,
      };

      queryClient.setQueryData(
        messagesQueryKey,
        (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
          updateMessages(oldData, (messages) => [
            ...messages,
            optimisticMessage,
          ]),
      );

      return {
        previousMessages,
        temporaryMessageId,
      };
    },

    onSuccess: (data, _content, context) => {
      queryClient.setQueryData(
        messagesQueryKey,
        (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
          updateMessages(oldData, (messages) =>
            messages.map((message) =>
              message.id === context?.temporaryMessageId
                ? data.data.message
                : message,
            ),
          ),
      );

      queryClient.setQueryData<GetConversationsResponse>(
        ["conversations"],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          const updatedConversations = oldData.data.conversations.map(
            (conv) => {
              if (conv.conversationId !== conversationId) {
                return conv;
              }

              return {
                ...conv,
                lastMessage: data.data.message.content,
                lastMessageAt: data.data.message.createdAt,
              };
            },
          );

          const updatedConversation = updatedConversations.find(
            (conv) => conv.conversationId === conversationId,
          );

          if (!updatedConversation) {
            return oldData;
          }

          const otherConversations = updatedConversations.filter(
            (conv) =>
              conv.conversationId !== updatedConversation.conversationId,
          );

          return {
            ...oldData,

            data: {
              ...oldData.data,

              conversations: [updatedConversation, ...otherConversations],
            },
          };
        },
      );
    },

    onError: (_error, _content, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesQueryKey, context.previousMessages);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
