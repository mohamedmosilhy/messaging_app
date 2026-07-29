import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";
import { ConversationList } from "./ConversationList";

export function ConversationSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 bg-card/45 px-4 backdrop-blur">
        <div>
          <h1 className="font-semibold tracking-tight">Messages</h1>
          <p className="text-xs text-muted-foreground">Your conversations</p>
        </div>
        <Button
          asChild
          aria-label="Start a new conversation"
          className="rounded-xl shadow-[0_0_1.5rem_oklch(0.77_0.16_165/0.14)]"
          size="icon"
        >
          <Link href="/search">
            <SquarePen aria-hidden="true" />
          </Link>
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </div>
  );
}
