import SignoutButton from "@/app/features/auth/components/SignoutButton";
import { getCurrentUser } from "@/app/features/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link"; // 1. Import Link

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const currUser = await getCurrentUser();

  return (
    <section>
      <div className="flex flex-col gap-2 border rounded-md w-2xl m-4 p-4">
        <div>welcome {currUser.data.displayName}</div>
        <div> username: {currUser.data.username}</div>
        <div>email: {currUser.data.email}</div>
        <div>avatar: {currUser.data.avatarUrl}</div>
        <div>bio: {currUser.data.bio}</div>
      </div>
      <SignoutButton />

      <Link
        href="/settings/profile"
        className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Edit Profile
      </Link>

      <Link
        href="/search"
        className="inline-block bg-blue-500 text-white py-2 px-4 m-2 rounded-md hover:bg-blue-600"
      >
        Search Users
      </Link>
    </section>
  );
}
