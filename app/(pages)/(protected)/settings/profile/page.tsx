"use server";

import { EditProfileForm, getCurrentUser } from "@/app/features/users";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <EditProfileForm
        user={{
          displayName: user.data.displayName,
          bio: user.data.bio,
          avatarUrl: user.data.avatarUrl,
        }}
      />
    </div>
  );
};

export default ProfilePage;
