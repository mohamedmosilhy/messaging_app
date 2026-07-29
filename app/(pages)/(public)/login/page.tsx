import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/app/features/auth/components/AuthShell";
import { LoginForm } from "@/app/features/auth/components/LoginForm";
import { auth } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const session = await auth();
  const { registered } = await searchParams;

  if (session) {
    redirect("/dashboard/conversations");
  }

  return (
    <AuthShell
      description="Welcome back. Enter your details to return to your conversations."
      eyebrow="Welcome back"
      footer={
        <>
          New to Relay?{" "}
          <Link
            className="font-medium text-primary hover:text-primary/80"
            href="/register"
          >
            Create an account
          </Link>
        </>
      }
      title="Sign in to Relay"
    >
      {registered === "1" ? (
        <div
          className="mb-5 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-sm text-primary"
          role="status"
        >
          Your account is ready. Sign in to open Relay.
        </div>
      ) : null}
      <LoginForm />
    </AuthShell>
  );
}
