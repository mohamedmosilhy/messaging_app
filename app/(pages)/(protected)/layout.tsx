import { redirect } from "next/navigation";

import { AppHeader } from "@/app/components/layout/app-header";
import { AppSidebar } from "@/app/components/layout/app-sidebar";
import type { ShellUser } from "@/app/components/layout/types";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";
import { auth } from "@/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user: ShellUser = {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.displayName,
    avatarUrl: session.user.avatarUrl,
  };

  return (
    <SidebarProvider className="bg-transparent [--sidebar-width:17rem]">
      <AppSidebar user={user} />
      <SidebarInset className="h-svh min-h-0 overflow-hidden border border-white/8 bg-background/70 shadow-[0_1.5rem_6rem_oklch(0_0_0/0.28)] backdrop-blur-xl">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
