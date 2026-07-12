"use client";
import { PublicProfile } from "../../users/types/search-user.types";
import { useQuery } from "@tanstack/react-query";
import { getConversationRequest } from "../actions/getConversationRequest";

const ConversationContent = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationRequest(conversationId),
  });

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
    </section>
  );
};

export default ConversationContent;
