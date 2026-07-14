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
