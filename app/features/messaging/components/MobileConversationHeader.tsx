import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";

export function MobileConversationHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center border-b px-3 md:hidden">
      <Button asChild size="sm" variant="ghost">
        <Link href="/dashboard/conversations">
          <ArrowLeft aria-hidden="true" />
          Inbox
        </Link>
      </Button>
    </header>
  );
}
