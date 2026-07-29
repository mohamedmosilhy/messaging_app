import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { getMessagesRequest } from "../actions/getMessagesRequest";
import { GetMessagesResponse, MessagesCursor } from "../types/messages.types";

export function useConversationMessages(conversationId: string) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useInfiniteQuery<
    GetMessagesResponse,
    Error,
    InfiniteData<GetMessagesResponse>,
    readonly ["messages", string],
    MessagesCursor | undefined
  >({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      getMessagesRequest({
        conversationId,
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
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
    isFetchNextPageError,
    refetch,
  };
}
