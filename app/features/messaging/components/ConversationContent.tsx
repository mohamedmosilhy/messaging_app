"use client";
import { PublicProfile } from "../../users/types/search-user.types";
import { useQuery } from "@tanstack/react-query";
import { getConversationRequest } from "../actions/getConversationRequest";
import { useConversationMessages } from "../hooks/useConversationMessages";

const ConversationContent = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationRequest(conversationId),
  });

  const {
    messages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationMessages(conversationId);

  if (isMessagesLoading) {
    return <div>Loading messages...</div>;
  }

  if (isMessagesError) {
    return <div>Error loading messages.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading conversation.</div>;
  }

  return (
    <section>
      <h1>Conversation ID: {data.data.conversationId}</h1>
      <p>Type: {data.data.type}</p>
      <p>Title: {data.data.title}</p>
      <p>Avatar URL: {data.data.avatarUrl}</p>
      <h2>Participants:</h2>
      <ul>
        {data.data.participants.map((participant: PublicProfile) => (
          <li key={participant.id}>
            {participant.displayName} ({participant.username})
          </li>
        ))}
      </ul>
      <ul className="mt-4 ">
        {messages.map((message) => (
          <li key={message.id} className="border-b border-gray-300 py-2">
            <strong className="text-lg font-bold">
              {message.sender.displayName}:
            </strong>{" "}
            {message.content}
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : "Load More"}
        </button>
      )}
    </section>
  );
};

export default ConversationContent;
