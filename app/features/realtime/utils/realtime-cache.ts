import type { InfiniteData } from "@tanstack/react-query";

import type {
  ConversationListItem,
  GetConversationsResponse,
} from "@/app/features/messaging/types/conversation.types";
import type {
  GetMessagesResponse,
  MessageResponse,
} from "@/app/features/messaging/types/messages.types";

export function mergeMessageIntoCache(
  oldData: InfiniteData<GetMessagesResponse> | undefined,
  incomingMessage: MessageResponse,
) {
  if (!oldData) return oldData;

  let found = false;
  const pages = oldData.pages.map((page) => ({
    ...page,
    data: {
      ...page.data,
      messages: page.data.messages.flatMap((message) => {
        const matches =
          message.id === incomingMessage.id ||
          message.clientId === incomingMessage.clientId;

        if (!matches) return [message];
        if (found) return [];

        found = true;
        return [incomingMessage];
      }),
    },
  }));

  if (!found && pages[0]) {
    pages[0] = {
      ...pages[0],
      data: {
        ...pages[0].data,
        messages: [...pages[0].data.messages, incomingMessage],
      },
    };
  }

  return { ...oldData, pages };
}

function isNewerThanConversation(
  message: MessageResponse,
  conversation: ConversationListItem,
) {
  if (conversation.lastMessageId === message.id) return false;
  if (!conversation.lastMessageAt) return true;

  return (
    new Date(message.createdAt).getTime() >=
    new Date(conversation.lastMessageAt).getTime()
  );
}

export function mergeMessageIntoInbox(
  oldData: GetConversationsResponse | undefined,
  message: MessageResponse,
  options: { currentUserId?: string; activeConversationId?: string },
) {
  if (!oldData) return oldData;

  const target = oldData.data.conversations.find(
    ({ conversationId }) => conversationId === message.conversationId,
  );

  if (!target || !isNewerThanConversation(message, target)) {
    return oldData;
  }

  const isIncoming = message.senderId !== options.currentUserId;
  const isActive = message.conversationId === options.activeConversationId;
  const updatedTarget: ConversationListItem = {
    ...target,
    lastMessageId: message.id,
    lastMessage: message.content,
    lastMessageAt: message.createdAt,
    unreadCount: isIncoming && !isActive ? target.unreadCount + 1 : 0,
  };

  return {
    ...oldData,
    data: {
      ...oldData.data,
      conversations: [
        updatedTarget,
        ...oldData.data.conversations.filter(
          ({ conversationId }) => conversationId !== message.conversationId,
        ),
      ],
    },
  };
}

export function applyReadEventToInbox(
  oldData: GetConversationsResponse | undefined,
  input: {
    conversationId: string;
    lastReadMessageId: string;
    unreadCount?: number;
  },
) {
  if (!oldData) return oldData;

  return {
    ...oldData,
    data: {
      ...oldData.data,
      conversations: oldData.data.conversations.map((conversation) =>
        conversation.conversationId === input.conversationId
          ? {
              ...conversation,
              unreadCount:
                input.unreadCount ??
                (conversation.lastMessageId === input.lastReadMessageId
                  ? 0
                  : conversation.unreadCount),
            }
          : conversation,
      ),
    },
  };
}
