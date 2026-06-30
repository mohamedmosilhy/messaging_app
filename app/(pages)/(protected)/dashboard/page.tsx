import SignoutButton from "@/app/features/auth/components/SignoutButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  return (
    <section>
      <div>Welcome {session.user.email}</div>
      <SignoutButton />
    </section>
  );
}
