import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessagesRequest } from "../actions/getMessagesRequest";

export function useConversationMessages(conversationId: string) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      getMessagesRequest({
        conversationId,
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
  });

  const messages =
    data?.pages
      .slice()
      .reverse()
      .flatMap((page) => page.data.messages) ?? [];

  return {
    messages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
