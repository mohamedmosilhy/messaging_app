import { MessagesSquare } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/shared/empty-state";
import { Button } from "@/app/components/ui/button";

export function ConversationEmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        action={
          <Button asChild>
            <Link href="/search">Start a conversation</Link>
          </Button>
        }
        compact
        description="Choose a conversation from the inbox or find someone new to message."
        icon={MessagesSquare}
        title="Your messages live here"
      />
    </div>
  );
}
