import { AtSign, MessageCircleMore, Pencil, Quote } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/app/components/shared/page-container";
import { UserAvatar } from "@/app/components/shared/user-avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { getUserProfile } from "@/app/features/users";
import { StartConversationButton } from "@/app/features/users/components/StartConversationButton";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  let user;

  try {
    user = await getUserProfile(username);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const isOwnProfile = session?.user?.id === user.data.id;

  return (
    <PageContainer className="max-w-4xl justify-center">
      <Card className="relative overflow-hidden border-white/10 bg-card/65 shadow-[0_2rem_7rem_oklch(0_0_0/0.3)] backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-36 bg-linear-to-br from-primary/18 via-cyan-400/8 to-violet-500/12"
        />
        <CardContent className="relative p-5 pt-20 sm:p-8 sm:pt-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <UserAvatar
              className="size-28 border-4 border-card bg-card shadow-xl ring-1 ring-white/10"
              name={user.data.displayName}
              src={user.data.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
                Relay profile
              </p>
              <h1 className="mt-1 truncate text-3xl font-semibold tracking-[-0.035em]">
                {user.data.displayName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <AtSign aria-hidden="true" className="size-3.5" />
                {user.data.username}
              </p>
            </div>
            {isOwnProfile ? (
              <Button asChild className="rounded-xl" variant="outline">
                <Link href="/settings/profile">
                  <Pencil aria-hidden="true" />
                  Edit profile
                </Link>
              </Button>
            ) : (
              <StartConversationButton targetUserId={user.data.id} />
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="rounded-2xl border border-white/8 bg-background/45 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Quote aria-hidden="true" className="size-4 text-primary" />
                About
              </div>
              <p className="mt-3 text-sm leading-7 text-foreground/85">
                {user.data.bio ||
                  "This person is keeping their introduction short for now."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-background/45 p-5">
              <MessageCircleMore
                aria-hidden="true"
                className="size-5 text-primary"
              />
              <p className="mt-3 text-sm font-medium">Direct conversations</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Messages stay between conversation participants.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
