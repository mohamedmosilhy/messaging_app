import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { sendMessageRequest } from "../actions/sendMessageRequest";
import { GetConversationsResponse } from "../types/conversation.types";
import {
  GetMessagesResponse,
  MessageResponse,
  SendMessageResponse,
} from "../types/messages.types";
import { mergeMessageIntoCache } from "@/app/features/realtime/utils/realtime-cache";

type SendMessageVariables = {
  clientId: string;
  content: string;
};

const getMessageError = (error: Error) =>
  error.message || "The message could not be sent.";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const messagesQueryKey = ["messages", conversationId] as const;

  function updateMessages(
    oldData: InfiniteData<GetMessagesResponse> | undefined,
    updater: (messages: MessageResponse[]) => MessageResponse[],
  ) {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          messages: updater(page.data.messages),
        },
      })),
    };
  }

  function appendToNewestPage(
    oldData: InfiniteData<GetMessagesResponse> | undefined,
    message: MessageResponse,
  ) {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              data: {
                ...page.data,
                messages: [...page.data.messages, message],
              },
            }
          : page,
      ),
    };
  }

  const mutation = useMutation<
    SendMessageResponse,
    Error,
    SendMessageVariables
  >({
    mutationFn: ({ clientId, content }) =>
      sendMessageRequest({
        conversationId,
        clientId,
        content,
      }),

    onMutate: async ({ clientId, content }) => {
      await queryClient.cancelQueries({ queryKey: messagesQueryKey });

      if (!session?.user) return;

      const cachedMessages =
        queryClient.getQueryData<InfiniteData<GetMessagesResponse>>(
          messagesQueryKey,
        );
      const alreadyExists = cachedMessages?.pages.some((page) =>
        page.data.messages.some((message) => message.clientId === clientId),
      );

      if (alreadyExists) {
        queryClient.setQueryData(
          messagesQueryKey,
          (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
            updateMessages(oldData, (messages) =>
              messages.map((message) =>
                message.clientId === clientId
                  ? {
                      ...message,
                      deliveryStatus: "sending",
                      deliveryError: undefined,
                    }
                  : message,
              ),
            ),
        );
        return;
      }

      const now = new Date();
      const optimisticMessage: MessageResponse = {
        id: `temp-${clientId}`,
        clientId,
        senderId: session.user.id,
        conversationId,
        content,
        createdAt: now,
        updatedAt: now,
        sender: {
          id: session.user.id,
          username: session.user.username,
          displayName: session.user.displayName,
          bio: session.user.bio,
          avatarUrl: session.user.avatarUrl,
        },
        deliveryStatus: "sending",
      };

      queryClient.setQueryData(
        messagesQueryKey,
        (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
          appendToNewestPage(oldData, optimisticMessage),
      );
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        messagesQueryKey,
        (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
          mergeMessageIntoCache(oldData, data.data.message),
      );

      queryClient.setQueryData<GetConversationsResponse>(
        ["conversations"],
        (oldData) => {
          if (!oldData) return oldData;

          const target = oldData.data.conversations.find(
            (item) => item.conversationId === conversationId,
          );

          if (
            !target ||
            (target.lastMessageAt &&
              new Date(target.lastMessageAt).getTime() >
                new Date(data.data.message.createdAt).getTime())
          ) {
            return oldData;
          }

          const updatedTarget = {
            ...target,
            lastMessageId: data.data.message.id,
            lastMessage: data.data.message.content,
            lastMessageAt: data.data.message.createdAt,
          };

          return {
            ...oldData,
            data: {
              ...oldData.data,
              conversations: [
                updatedTarget,
                ...oldData.data.conversations.filter(
                  (item) => item.conversationId !== conversationId,
                ),
              ],
            },
          };
        },
      );
    },

    onError: (error, { clientId }) => {
      queryClient.setQueryData(
        messagesQueryKey,
        (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
          updateMessages(oldData, (messages) =>
            messages.map((message) =>
              message.clientId === clientId
                ? {
                    ...message,
                    deliveryStatus: "failed",
                    deliveryError: getMessageError(error),
                  }
                : message,
            ),
          ),
      );
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  function sendMessage(content: string) {
    mutation.mutate({ content, clientId: crypto.randomUUID() });
  }

  function retryMessage(message: MessageResponse) {
    mutation.mutate({
      clientId: message.clientId,
      content: message.content,
    });
  }

  function removeFailedMessage(clientId: string) {
    queryClient.setQueryData(
      messagesQueryKey,
      (oldData: InfiniteData<GetMessagesResponse> | undefined) =>
        updateMessages(oldData, (messages) =>
          messages.filter(
            (message) =>
              message.clientId !== clientId ||
              message.deliveryStatus !== "failed",
          ),
        ),
    );
  }

  return {
    sendMessage,
    retryMessage,
    removeFailedMessage,
  };
}
