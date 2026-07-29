import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";

export function MobileConversationHeader() {
  return (
    <div className="md:hidden">
      <Button
        aria-label="Back to inbox"
        asChild
        className="px-1"
        size="icon"
        variant="ghost"
      >
        <Link href="/dashboard/conversations">
          <ArrowLeft aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
