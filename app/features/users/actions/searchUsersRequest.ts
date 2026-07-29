import type { SearchUsersResponse } from "../types/search-user.types";

export async function searchUsersRequest({
  query,
  limit,
  cursor,
}: {
  query: string;
  limit: number;
  cursor?: string;
}): Promise<SearchUsersResponse> {
  const res = await fetch(
    `/api/users/search?query=${encodeURIComponent(query)}&limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
  );

  if (!res.ok) {
    throw new Error("Failed to search users.");
  }
  return res.json() as Promise<SearchUsersResponse>;
}
