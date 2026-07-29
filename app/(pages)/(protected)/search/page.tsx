"use client";

import { useState } from "react";

import { PageContainer } from "@/app/components/shared/page-container";
import { PageHeader } from "@/app/components/shared/page-header";
import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { PublicProfile } from "@/app/features/users/types/search-user.types";
import { openConversationRequest } from "@/app/features/messaging/actions/openConversationRequest";
import { useSearchQuery } from "@/app/hooks/useSearchQuery";
import { getConversationUrl } from "@/app/utils/getConversationUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isFetching, error } = useSearchQuery(query);
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        description="Find someone by their display name or username."
        title="Start a new conversation"
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="search">
              Search people
            </label>
            <Input
              autoComplete="off"
              id="search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or username"
              type="search"
              value={query}
            />
          </div>

          {isFetching ? (
            <p className="text-sm text-muted-foreground" role="status">
              Searching…
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}
          {data && data.data.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : null}

          {data && data.data.users.length > 0 ? (
            <ul className="divide-y">
              {data.data.users.map((user: PublicProfile) => (
                <li
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                  key={user.id}
                >
                  <UserAvatar
                    name={user.displayName || user.username}
                    src={user.avatarUrl}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.displayName || user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/users/${user.username}`}>View profile</Link>
                    </Button>
                    <Button
                      onClick={async () => {
                        const res = await openConversationRequest(user.id);
                        if (res.success) {
                          router.push(
                            getConversationUrl(res.data.conversationId),
                          );
                        }
                      }}
                      size="sm"
                    >
                      Message
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
