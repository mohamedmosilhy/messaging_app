import { MapPinOff } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/app/components/shared/empty-state";
import { Button } from "@/app/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <EmptyState
        action={
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        }
        description="The address does not point to an available page."
        icon={MapPinOff}
        title="Nothing here"
      />
    </main>
  );
}
