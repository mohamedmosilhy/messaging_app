"use client";

import { LoaderCircle, Search, Sparkles, UserRoundSearch } from "lucide-react";
import { useState } from "react";

import { PageContainer } from "@/app/components/shared/page-container";
import { PageHeader } from "@/app/components/shared/page-header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/app/components/ui/input-group";
import { UserSearchResult } from "@/app/features/users/components/UserSearchResult";
import { useSearchQuery } from "@/app/features/users/hooks/useSearchQuery";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const search = useSearchQuery(query);
  const hasQuery = query.trim().length > 0;
  const isSearching = search.isDebouncing || search.isLoading;

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        description="Find someone by display name or username and open a direct conversation."
        title="Start a new conversation"
      />

      <Card className="overflow-hidden border-white/10 bg-card/65 shadow-[0_1.5rem_5rem_oklch(0_0_0/0.22)] backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="border-b border-white/8 p-4 sm:p-5">
            <label className="sr-only" htmlFor="people-search">
              Search people
            </label>
            <InputGroup className="h-12 rounded-2xl bg-background/65">
              <InputGroupAddon className="pl-3">
                {isSearching ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin text-primary"
                  />
                ) : (
                  <Search aria-hidden="true" />
                )}
              </InputGroupAddon>
              <InputGroupInput
                autoComplete="off"
                autoFocus
                id="people-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or @username"
                type="search"
                value={query}
              />
              <InputGroupAddon align="inline-end">
                <span className="rounded-md border border-white/8 bg-white/5 px-1.5 py-0.5 text-[0.65rem]">
                  {search.users.length} found
                </span>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="min-h-80 p-2 sm:p-3">
            {!hasQuery ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-3xl border border-primary/15 bg-primary/8 text-primary">
                  <UserRoundSearch aria-hidden="true" className="size-6" />
                </span>
                <h2 className="mt-5 font-semibold">Find your people</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Search by a name or username. Blocked accounts and your own
                  profile stay out of the results.
                </p>
              </div>
            ) : null}

            {hasQuery && search.error ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <p className="font-medium">Search is unavailable</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search.error.message}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => void search.refetch()}
                  variant="outline"
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {hasQuery &&
            !isSearching &&
            !search.error &&
            search.users.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-3xl border border-white/8 bg-white/4 text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-6" />
                </span>
                <h2 className="mt-5 font-semibold">No matches yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different spelling or a shorter username.
                </p>
              </div>
            ) : null}

            {search.users.length > 0 ? (
              <>
                <ul aria-label="People" className="space-y-1">
                  {search.users.map((user) => (
                    <UserSearchResult key={user.id} user={user} />
                  ))}
                </ul>
                {search.hasNextPage ? (
                  <div className="flex justify-center border-t border-white/8 pt-4 pb-2">
                    <Button
                      disabled={search.isFetchingNextPage}
                      onClick={() => void search.fetchNextPage()}
                      variant="outline"
                    >
                      {search.isFetchingNextPage ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="animate-spin"
                        />
                      ) : null}
                      {search.isFetchingNextPage
                        ? "Loading more"
                        : "Load more people"}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
