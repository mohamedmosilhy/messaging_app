"use server";

import { EditProfileForm, getCurrentUser } from "@/app/features/users";

const ProfilePage = async () => {
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
