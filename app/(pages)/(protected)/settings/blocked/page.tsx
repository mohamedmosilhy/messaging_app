import { PageContainer } from "@/app/components/shared/page-container";
import { PageHeader } from "@/app/components/shared/page-header";
import { Card, CardContent } from "@/app/components/ui/card";
import { BlockedUsersList } from "@/app/features/blocking";

export default function BlockedAccountsPage() {
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        description="Review accounts you have blocked. Blocking stops discovery, new conversations, and messages while preserving existing history."
        title="Blocked accounts"
      />
      <Card className="border-white/10 bg-card/65 shadow-[0_1.5rem_5rem_oklch(0_0_0/0.22)] backdrop-blur-xl">
        <CardContent className="p-4 sm:p-6">
          <BlockedUsersList />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
