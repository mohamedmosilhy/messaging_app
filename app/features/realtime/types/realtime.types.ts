import type { MessageResponse } from "@/app/features/messaging/types/messages.types";

export type RealtimeMessage = Omit<
  MessageResponse,
  "createdAt" | "updatedAt" | "deliveryStatus" | "deliveryError"
> & {
  createdAt: string;
  updatedAt: string;
};

export type MessageCreatedData = {
  message: RealtimeMessage;
  clientMessageId: string;
};

export type ConversationUpdatedData = {
  conversationId: string;
  lastMessageId: string;
  lastMessage: string;
  lastMessageAt: string;
};

export type ConversationReadData = {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: string;
};

export type RealtimeEventDataMap = {
  "message.created": MessageCreatedData;
  "conversation.updated": ConversationUpdatedData;
  "conversation.read": ConversationReadData;
};

export type RealtimeEventType = keyof RealtimeEventDataMap;

export type RealtimeEventEnvelope = {
  [Type in RealtimeEventType]: {
    eventId: string;
    type: Type;
    version: 1;
    occurredAt: string;
    data: RealtimeEventDataMap[Type];
  };
}[RealtimeEventType];

export type MarkConversationReadResponse = {
  success: true;
  data: ConversationReadData & {
    unreadCount: number;
  };
};

export function toRealtimeMessage(message: MessageResponse): RealtimeMessage {
  return {
    id: message.id,
    clientId: message.clientId,
    senderId: message.senderId,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: new Date(message.createdAt).toISOString(),
    updatedAt: new Date(message.updatedAt).toISOString(),
    sender: message.sender,
  };
}

export function fromRealtimeMessage(message: RealtimeMessage): MessageResponse {
  return {
    ...message,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
  };
}
