import SignoutButton from "@/app/features/auth/components/SignoutButton";
import { getCurrentUser } from "@/app/features/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    </section>
  );
}
