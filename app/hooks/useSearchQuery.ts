import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import { searchUsersRequest } from "../features/users/actions/searchUsersRequest";

export function useSearchQuery(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  const { data, isFetching, error } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => {
      return searchUsersRequest({ query: debouncedQuery, limit: 10 });
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  return {
    data,
    isFetching,
    error,
  };
}
