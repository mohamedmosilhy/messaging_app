import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar";

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="h-11" size="lg">
          <Link href="/dashboard/conversations">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircleMore aria-hidden="true" className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">Relay</span>
              <span className="truncate text-xs text-muted-foreground">
                Direct messaging
              </span>
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
