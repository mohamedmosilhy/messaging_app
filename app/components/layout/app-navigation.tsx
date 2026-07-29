"use client";

import {
  MessageSquareText,
  Search,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Inbox",
    href: "/dashboard/conversations",
    icon: MessageSquareText,
    isActive: (pathname) => pathname.startsWith("/dashboard/conversations"),
  },
  {
    label: "New chat",
    href: "/search",
    icon: Search,
    isActive: (pathname) => pathname === "/search",
  },
  {
    label: "Profile settings",
    href: "/settings/profile",
    icon: Settings2,
    isActive: (pathname) => pathname.startsWith("/settings"),
  },
];

export function AppNavigation() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive(pathname)}
                tooltip={item.label}
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
