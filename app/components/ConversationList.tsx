"use client";
import { useConversations } from "../features/messaging/hooks/useConversations";
import { ConversationListItem } from "../features/messaging/types/conversation.types";

const ConversationList = () => {
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
          <li
            key={conv.conversationId}
            className="p-4 bg-white rounded-lg shadow-md"
          >
            <div className="font-semibold">{conv.title}</div>
            <div className=" rounded-full overflow-hidden">
              {conv.avatarUrl}
            </div>
            <div className="text-gray-600">{conv.lastMessage}</div>
            <div className="text-sm text-gray-500">
              {String(conv.lastMessageAt)}
            </div>
          </li>
        ))
      ) : (
        <p>No conversations found.</p>
      )}
    </ul>
  );
};

export default ConversationList;
