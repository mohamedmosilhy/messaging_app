import { Message } from "@/generated/prisma/client";
import { publicProfileSelect } from "../../users/types/user-profile.types";

export type MessagesCursor = {
  id: string;
  createdAt: string;
};

export type GetMessagesRequest = {
  conversationId: string;
  limit?: number;
  cursor?: MessagesCursor;
};

export type GetMessagesResponse = {
  success: true;
  data: {
    messages: Message[];
    nextCursor: MessagesCursor | null;
  };
};

export const messageResponseSelect = {
  id: true,
  senderId: true,
  conversationId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    select: publicProfileSelect,
  },
} as const;

export type SendMessageRequest = {
  conversationId: string;
  content: string;
};

export type MessageResponse = {
  content: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  senderId: string;
};

export type SendMessageResponse = {
  success: true;
  data: {
    message: MessageResponse;
  };
};
