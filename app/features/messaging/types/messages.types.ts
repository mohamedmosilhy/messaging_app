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
    messages: MessageResponse[];
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
  isOptimistic?: boolean;
};

export type SendMessageResponse = {
  success: true;
  data: {
    message: MessageResponse;
  };
};
