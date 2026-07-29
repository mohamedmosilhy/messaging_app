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
      <Card className="max-w-2xl">
        <CardContent>
          <EditProfileForm
            user={{
              displayName: user.data.displayName,
              bio: user.data.bio,
              avatarUrl: user.data.avatarUrl,
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
