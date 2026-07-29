import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/app/features/auth/components/AuthShell";
import { RegisterForm } from "@/app/features/auth/components/RegisterForm";
import { auth } from "@/auth";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard/conversations");
  }

  return (
    <AuthShell
      description="Create your identity and start focused, one-to-one conversations."
      eyebrow="Join Relay"
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:text-primary/80"
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
      title="Create your account"
    >
      <RegisterForm />
    </AuthShell>
  );
}
