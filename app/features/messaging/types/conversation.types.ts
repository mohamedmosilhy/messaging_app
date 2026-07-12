export type openConversationRequest = {
  targetUserId: string;
};

export type openConversationResponse = {
  success: true;
  data: {
    conversationId: string;
  };
};

export type openConversationError = {
  success: false;
  message: string;
};
