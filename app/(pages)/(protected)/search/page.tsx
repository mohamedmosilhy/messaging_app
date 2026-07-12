"use client";

import { useState } from "react";

import { PublicProfile } from "@/app/features/users/types/search-user.types";
import Link from "next/link";
import { useSearchQuery } from "@/app/hooks/useSearchQuery";
import { openConversationRequest } from "@/app/features/messaging/actions/openConversationRequest";
import { useRouter } from "next/dist/client/components/navigation";
import { getConversationUrl } from "@/app/utils/getConversationUrl";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isFetching, error } = useSearchQuery(query);
  const router = useRouter();

  return (
    <section>
      <div className="flex items-center justify-center gap-1 py-2 m-2 w-fit">
        <label
          htmlFor="search"
          className="text-sm font-medium text-gray-700 w-fit"
        >
          Search
        </label>
        <input
          id="search"
          placeholder="Search users..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isFetching && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {data && data.data.users.length === 0 && (
        <p className="text-gray-500">No users found.</p>
      )}

      {data && data.data.users.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {data.data.users.map((user: PublicProfile) => (
            <li key={user.id} className="py-2 flex gap-5 items-center">
              <span>{user.displayName || user.username}</span>
              <Link
                href={`/users/${user.username}`}
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                Show Profile
              </Link>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={async () => {
                  const res = await openConversationRequest(user.id);
                  if (res.success) {
                    router.push(getConversationUrl(res.data.conversationId));
                  }
                }}
              >
                Start Conversation
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
