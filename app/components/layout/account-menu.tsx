"use client";

import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { UserAvatar } from "@/app/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";
import type { ShellUser } from "./types";

export function AccountMenu({ user }: { user: ShellUser }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="h-12 rounded-xl data-[state=open]:bg-sidebar-accent"
              size="lg"
            >
              <UserAvatar
                name={user.displayName}
                size="lg"
                src={user.avatarUrl}
              />
              <span className="grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate font-medium">{user.displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </span>
              <ChevronsUpDown aria-hidden="true" className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <p className="truncate font-medium">{user.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                @{user.username}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/settings/profile"
                onClick={() => setOpenMobile(false)}
              >
                <UserRound aria-hidden="true" />
                Profile settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                void signOut({ callbackUrl: "/login", redirect: true })
              }
              variant="destructive"
            >
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
