import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TooltipProvider } from "@/app/components/ui/tooltip";
import { cn } from "@/app/lib/utils";

import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "Relay",
    template: "%s · Relay",
  },
  description: "A focused direct-messaging application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full font-sans antialiased", geist.variable)}
    >
      <body className="min-h-svh bg-background text-foreground">
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
