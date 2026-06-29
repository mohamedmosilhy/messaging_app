"use client";
import { signOut } from "next-auth/react";

export default function SignoutButton() {
  const signout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };
  return <button onClick={signout}>Sign Out</button>;
}
