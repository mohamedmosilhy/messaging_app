import type { ReactNode } from "react";

import { cn } from "@/app/lib/utils";

type MessagingWorkspaceProps = {
  sidebar: ReactNode;
  content: ReactNode;
  mobilePane: "sidebar" | "content";
};

export function MessagingWorkspace({
  sidebar,
  content,
  mobilePane,
}: MessagingWorkspaceProps) {
  return (
    <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden bg-background/35 md:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
      <aside
        aria-label="Conversations"
        className={cn(
          "min-h-0 min-w-0 border-r border-white/8 bg-card/65 backdrop-blur-xl",
          mobilePane === "content" && "hidden md:block",
        )}
      >
        {sidebar}
      </aside>
      <section
        aria-label="Conversation"
        className={cn(
          "min-h-0 min-w-0 bg-background/55",
          mobilePane === "sidebar" && "hidden md:block",
        )}
      >
        {content}
      </section>
    </div>
  );
}
