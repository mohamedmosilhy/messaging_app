import { RegisterForm } from "@/app/features/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <section className="flex flex-col justify-center items-center mt-4 min-h-screen">
      <RegisterForm />
    </section>
  );
}
