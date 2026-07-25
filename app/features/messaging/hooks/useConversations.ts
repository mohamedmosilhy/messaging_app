import { useQuery } from "@tanstack/react-query";
import { getConversationsRequest } from "../actions/getConversationsRequest";

export function useConversations() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversationsRequest,
  });

  return {
    conversations: data?.data.conversations ?? [],
    isLoading,
    error,
    isError,
  };
}
