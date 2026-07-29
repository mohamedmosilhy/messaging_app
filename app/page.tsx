import {
  ArrowRight,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/components/ui/button";
import { auth } from "@/auth";

const principles = [
  {
    icon: Zap,
    title: "Instant by design",
    description: "Optimistic conversations keep every interaction responsive.",
  },
  {
    icon: ShieldCheck,
    title: "Private workspace",
    description: "Protected sessions and participant-aware conversations.",
  },
  {
    icon: Sparkles,
    title: "Focused experience",
    description: "A calm interface built around people, not distractions.",
  },
];

export default async function Home() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);
  const dashboardHref = "/dashboard/conversations";

  return (
    <main
      className="relative min-h-svh overflow-hidden"
      id="main-content"
      tabIndex={-1}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.025)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.025)_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <nav className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          className="flex items-center gap-3"
          href={isSignedIn ? dashboardHref : "/"}
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_2rem_oklch(0.77_0.16_165/0.2)]">
            <MessageCircleMore aria-hidden="true" className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">Relay</span>
        </Link>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <span className="hidden max-w-52 truncate text-sm text-muted-foreground sm:block">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {session?.user.displayName}
                </span>
              </span>
              <Button asChild>
                <Link href={dashboardHref}>
                  Dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-5 pt-20 pb-24 text-center sm:px-8 sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles aria-hidden="true" className="size-3.5" />
          {isSignedIn
            ? `Welcome back, ${session?.user.displayName}`
            : "Conversations, refined"}
        </div>
        <h1 className="mt-7 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance sm:text-7xl">
          Messaging that feels
          <span className="block bg-linear-to-r from-primary via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            effortlessly focused.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Relay brings your direct conversations into one fast, calm, and
          beautifully organized workspace.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {isSignedIn ? (
            <Button asChild className="h-11 rounded-xl px-5">
              <Link href={dashboardHref}>
                Continue to your dashboard
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/register">
                  Create your account
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-xl px-5"
                variant="outline"
              >
                <Link href="/login">Open Relay</Link>
              </Button>
            </>
          )}
        </div>

        <div className="mt-24 grid w-full max-w-5xl gap-4 text-left md:grid-cols-3">
          {principles.map(({ icon: Icon, title, description }) => (
            <article
              className="rounded-3xl border border-white/10 bg-card/60 p-6 shadow-[0_1.5rem_4rem_oklch(0_0_0/0.2)] backdrop-blur"
              key={title}
            >
              <span className="flex size-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-5 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
