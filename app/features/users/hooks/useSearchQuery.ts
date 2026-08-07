import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

import { searchUsersRequest } from "@/app/features/users/actions/searchUsersRequest";
import {
  SearchUsersResponse,
  type PublicProfile,
} from "@/app/features/users/types/search-user.types";
import { useDebounce } from "@/app/hooks/useDebounce";

export function useSearchQuery(query: string) {
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebounce(normalizedQuery, 300);
  const result = useInfiniteQuery<
    SearchUsersResponse,
    Error,
    InfiniteData<SearchUsersResponse>,
    readonly ["users", "search", string],
    string | undefined
  >({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: ({ pageParam }) =>
      searchUsersRequest({
        query: debouncedQuery,
        limit: 10,
        cursor: pageParam,
      }),
    enabled: debouncedQuery.length > 0,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  });

  const users =
    result.data?.pages.flatMap((page) => page.data.users as PublicProfile[]) ??
    [];

  return {
    ...result,
    users,
    debouncedQuery,
    isDebouncing: normalizedQuery !== debouncedQuery,
  };
}
