"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const login = async () => {
    const res = await signIn("credentials", {
      email: "mohamed@example.com",
      password: "Password123!",
      redirect: false,
    });
    console.log(res);
    router.push("/dashboard");
  };
  return <button onClick={login}>Login</button>;
}
