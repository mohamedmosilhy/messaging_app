import { PublicProfile } from "../../users/types/search-user.types";

export type OpenConversationRequest = {
  targetUserId: string;
};

export type OpenConversationResponse = {
  success: true;
  data: {
    conversationId: string;
  };
};

export type OpenConversationError = {
  success: false;
  message: string;
};

export type GetConversationRequest = {
  conversationId: string;
};

export type GetConversationResponse = {
  success: true;
  data: {
    conversationId: string;
    type: "DIRECT" | "GROUP";
    title: string;
    avatarUrl: string | null;
    participants: PublicProfile[];
  };
};
