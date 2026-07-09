"use client";
import { signOut } from "next-auth/react";

export default function SignoutButton() {
  const signout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };
  return (
    <button
      onClick={signout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-1 rounded"
    >
      Sign Out
    </button>
  );
}
