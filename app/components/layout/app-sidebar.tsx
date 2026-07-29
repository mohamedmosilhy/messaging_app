import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/app/components/ui/sidebar";
import { AccountMenu } from "./account-menu";
import { AppNavigation } from "./app-navigation";
import { SidebarBrand } from "./sidebar-brand";
import type { ShellUser } from "./types";

export function AppSidebar({ user }: { user: ShellUser }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <AppNavigation />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <AccountMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
