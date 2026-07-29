"use server";

import { PageContainer } from "@/app/components/shared/page-container";
import { PageHeader } from "@/app/components/shared/page-header";
import { Card, CardContent } from "@/app/components/ui/card";
import { EditProfileForm, getCurrentUser } from "@/app/features/users";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  return (
    <PageContainer>
      <PageHeader
        description="Manage the public details people see in conversations."
        title="Profile settings"
      />
      <Card className="overflow-hidden border-white/10 bg-card/65 shadow-[0_1.5rem_5rem_oklch(0_0_0/0.22)] backdrop-blur-xl">
        <CardContent className="p-5 sm:p-7">
          <EditProfileForm
            user={{
              displayName: user.data.displayName,
              bio: user.data.bio ?? "",
              avatarUrl: user.data.avatarUrl ?? "",
              email: user.data.email,
              username: user.data.username,
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
