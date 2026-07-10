import { getUserProfile } from "@/app/features/users";
import { notFound } from "next/navigation";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";

type Props = {
  params: Promise<{ username: string }>;
};

async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  let user;
  try {
    user = await getUserProfile(username);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col gap-2 border rounded-md w-2xl m-4 p-4">
        <div>Display Name: {user.data.displayName}</div>
        <div>Username: {user.data.username}</div>
        <div>Avatar: {user.data.avatarUrl}</div>
        <div>Bio: {user.data.bio}</div>
      </div>
    </section>
  );
}

export default UserProfilePage;
