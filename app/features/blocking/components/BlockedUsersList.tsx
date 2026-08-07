"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/shared/empty-state";
import { ErrorState } from "@/app/components/shared/error-state";
import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useBlockedUsers } from "../hooks/useBlocking";
import { BlockUserButton } from "./BlockUserButton";

export function BlockedUsersList() {
  const query = useBlockedUsers();

  if (query.isLoading) {
    return (
      <div
        aria-label="Loading blocked accounts"
        className="space-y-2"
        role="status"
      >
        {[0, 1, 2].map((item) => (
          <Skeleton className="h-20 rounded-2xl" key={item} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        description={query.error.message}
        onRetry={() => void query.refetch()}
        title="Could not load blocked accounts"
      />
    );
  }

  const users = query.data?.data.users ?? [];

  if (users.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <EmptyState
          action={
            <Button asChild variant="outline">
              <Link href="/search">Find people</Link>
            </Button>
          }
          compact
          description="Accounts you block will appear here, where you can unblock them at any time."
          icon={ShieldCheck}
          title="No blocked accounts"
        />
      </div>
    );
  }

  return (
    <ul aria-label="Blocked accounts" className="space-y-2">
      {users.map((user) => (
        <li
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-background/45 p-3 sm:p-4"
          key={user.id}
        >
          <UserAvatar
            className="size-11 ring-1 ring-white/10"
            name={user.displayName}
            src={user.avatarUrl}
          />
          <div className="min-w-0 flex-1">
            <Link
              className="truncate text-sm font-semibold hover:text-primary"
              href={`/users/${user.username}`}
            >
              {user.displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              @{user.username}
            </p>
          </div>
          <BlockUserButton
            compact
            displayName={user.displayName}
            initialStatus={{
              success: true,
              data: {
                targetUserId: user.id,
                isBlockedByCurrentUser: true,
                canInteract: false,
              },
            }}
            targetUserId={user.id}
          />
        </li>
      ))}
    </ul>
  );
}
