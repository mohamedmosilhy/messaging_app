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
      className={cn(
        "dark h-full font-sans antialiased [color-scheme:dark]",
        geist.variable,
      )}
    >
      <body className="min-h-svh bg-background text-foreground [background-image:radial-gradient(circle_at_top_left,oklch(0.77_0.16_165/0.08),transparent_28rem),radial-gradient(circle_at_bottom_right,oklch(0.62_0.16_285/0.07),transparent_32rem)]">
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
