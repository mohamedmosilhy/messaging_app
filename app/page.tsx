import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl text-center p-4">Messaging App</h1>{" "}
      <Link href="/dashboard" className="text-blue-500 underline">
        Go to Dashboard
      </Link>
      <Link href="/login" className="text-blue-500 underline">
        Login
      </Link>
    </div>
  );
}
