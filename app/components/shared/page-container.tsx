import type { ReactNode } from "react";

import { cn } from "@/app/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
