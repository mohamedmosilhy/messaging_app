"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/app/components/ui/separator";
import { SidebarTrigger } from "@/app/components/ui/sidebar";
import { cn } from "@/app/lib/utils";

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard/conversations") return "Inbox";
  if (pathname.startsWith("/dashboard/conversations/")) return "Conversation";
  if (pathname === "/search") return "New chat";
  if (pathname.startsWith("/settings")) return "Profile settings";
  if (pathname.startsWith("/users/")) return "Contact profile";
  return "Relay";
}

export function AppHeader() {
  const pathname = usePathname();
  const isConversationDetail =
    pathname.startsWith("/dashboard/conversations/") &&
    pathname !== "/dashboard/conversations";

  return (
    <header
      className={cn(
        "h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-background/65 px-4 backdrop-blur-xl",
        isConversationDetail ? "hidden md:flex" : "flex",
      )}
    >
      <SidebarTrigger aria-label="Toggle navigation" />
      <Separator className="h-4!" orientation="vertical" />
      <p className="truncate text-sm font-medium">{getPageTitle(pathname)}</p>
    </header>
  );
}
