"use client";
import { useConversations } from "../hooks/useConversations";
import { ConversationListItem } from "../types/conversation.types";
import ConversationListItemComponent from "./ConversationListItemComponent";

export const ConversationList = () => {
  const { conversations, isLoading, error, isError } = useConversations();

  if (isLoading) {
    return <div>Loading conversations...</div>;
  }

  if (isError) {
    return <div>Error loading conversations: {error?.message}</div>;
  }

  return (
    <ul className="space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
      {conversations.length > 0 ? (
        conversations.map((conv: ConversationListItem) => (
          <ConversationListItemComponent
            key={conv.conversationId}
            conversation={conv}
          />
        ))
      ) : (
        <p>No conversations found.</p>
      )}
    </ul>
  );
};
