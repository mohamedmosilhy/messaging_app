"use client";

import { LoginForm } from "@/app/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-2">
      <LoginForm />
    </section>
  );
}
