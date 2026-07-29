import { PageContainer } from "@/app/components/shared/page-container";
import { PageHeader } from "@/app/components/shared/page-header";
import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { getUserProfile } from "@/app/features/users";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { notFound } from "next/navigation";

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
    <PageContainer>
      <PageHeader
        description="Public contact information"
        title={user.data.displayName}
      />
      <Card className="max-w-2xl">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <UserAvatar
            className="size-20"
            name={user.data.displayName}
            src={user.data.avatarUrl}
          />
          <div className="min-w-0 space-y-2">
            <div>
              <p className="font-semibold">{user.data.displayName}</p>
              <p className="text-sm text-muted-foreground">
                @{user.data.username}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {user.data.bio || "This user has not added a bio yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default UserProfilePage;
