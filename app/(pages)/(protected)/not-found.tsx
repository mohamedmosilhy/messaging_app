import { MessageCircleOff } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/shared/empty-state";
import { Button } from "@/app/components/ui/button";

export default function ProtectedNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        action={
          <Button asChild>
            <Link href="/dashboard/conversations">Return to inbox</Link>
          </Button>
        }
        description="The page may have moved, or you may not have access to it."
        icon={MessageCircleOff}
        title="Page not found"
      />
    </div>
  );
}
