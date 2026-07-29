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
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Relay",
    template: "%s · Relay",
  },
  description:
    "A polished direct-messaging application with optimistic delivery, secure sessions, and focused conversations.",
  applicationName: "Relay",
  keywords: [
    "messaging",
    "direct messaging",
    "Next.js",
    "Prisma",
    "React Query",
  ],
  authors: [{ name: "Mohamed Mosilhy" }],
  openGraph: {
    type: "website",
    siteName: "Relay",
    title: "Relay · Conversations, refined",
    description:
      "A polished direct-messaging application built with Next.js and PostgreSQL.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relay · Conversations, refined",
    description:
      "A polished direct-messaging application built with Next.js and PostgreSQL.",
  },
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
        <a
          className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
          href="#main-content"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
