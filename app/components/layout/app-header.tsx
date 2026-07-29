"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/app/components/ui/separator";
import { SidebarTrigger } from "@/app/components/ui/sidebar";

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

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
      <SidebarTrigger aria-label="Toggle navigation" />
      <Separator className="h-4!" orientation="vertical" />
      <p className="truncate text-sm font-medium">{getPageTitle(pathname)}</p>
    </header>
  );
}
