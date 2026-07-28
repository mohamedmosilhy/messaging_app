import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { sendMessageRequest } from "../actions/sendMessageRequest";
import {
  GetMessagesResponse,
  MessageResponse,
  SendMessageResponse,
} from "../types/messages.types";
import { useSession } from "next-auth/react";

type SendMessageContext = {
  previousMessages?: InfiniteData<GetMessagesResponse>;
  temporaryMessageId?: string;
};

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const messagesQueryKey = ["messages", conversationId] as const;

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

    onMutate: async (content: string) => {
      // stop any outgoing refetches (so they don't overwrite our optimistic update)
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
      const temporaryMessageId = `temp-${Date.now()}-${Math.random()}`;

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

      queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(
        messagesQueryKey,
        (oldData) => {
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
                      messages: [...page.data.messages, optimisticMessage],
                    },
                  }
                : page,
            ),
          };
        },
      );

      return { previousMessages, temporaryMessageId };
    },

    onSuccess: (data, _content, context) => {
      queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(
        messagesQueryKey,
        (oldData) => {
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
                      messages: page.data.messages.map((msg) =>
                        msg.id === context?.temporaryMessageId
                          ? {
                              ...data.data.message,
                            }
                          : msg,
                      ),
                    },
                  }
                : page,
            ),
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
