import { Check, MessageCircleMore, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  footer: ReactNode;
  eyebrow: string;
  title: string;
};

const highlights = [
  "Fast optimistic conversations",
  "Focused, distraction-free workspace",
  "Private account-based messaging",
];

export function AuthShell({
  children,
  description,
  footer,
  eyebrow,
  title,
}: AuthShellProps) {
  return (
    <main className="relative grid min-h-svh overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,oklch(1_0_0/0.025)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.025)_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />
      <section className="relative hidden border-r border-white/8 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Link
          className="flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          href="/"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_2rem_oklch(0.77_0.16_165/0.22)]">
            <MessageCircleMore aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-semibold tracking-tight">Relay</span>
            <span className="block text-xs text-muted-foreground">
              Conversations, refined.
            </span>
          </span>
        </Link>

        <div className="max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles aria-hidden="true" className="size-3.5" />A calmer way to
            stay connected
          </div>
          <div className="space-y-4">
            <p className="text-4xl leading-tight font-semibold tracking-[-0.035em] text-balance xl:text-5xl">
              Every conversation,
              <span className="block bg-linear-to-r from-primary via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                exactly where it belongs.
              </span>
            </p>
            <p className="max-w-lg text-base leading-7 text-muted-foreground">
              A focused messaging workspace designed around the people and
              conversations that matter.
            </p>
          </div>
          <ul className="space-y-3">
            {highlights.map((highlight) => (
              <li
                className="flex items-center gap-3 text-sm text-foreground/85"
                key={highlight}
              >
                <span className="flex size-6 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <Check aria-hidden="true" className="size-3.5" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
          Built with secure account sessions and protected conversations.
        </div>
      </section>

      <section className="relative flex min-h-svh items-center justify-center px-4 py-10 sm:px-8">
        <div
          aria-hidden="true"
          className="absolute top-[18%] left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative w-full max-w-md">
          <Link
            className="mb-10 flex w-fit items-center gap-2 lg:hidden"
            href="/"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageCircleMore aria-hidden="true" className="size-4" />
            </span>
            <span className="font-semibold">Relay</span>
          </Link>
          <div className="rounded-3xl border border-white/10 bg-card/75 p-6 shadow-[0_2rem_6rem_oklch(0_0_0/0.35)] backdrop-blur-xl sm:p-8">
            <div className="mb-7 space-y-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em]">
                {title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
            <div className="mt-7 border-t border-white/8 pt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
