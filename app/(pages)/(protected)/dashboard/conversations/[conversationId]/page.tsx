import { ConversationContent } from "@/app/features/messaging";
import { ConversationSidebar } from "@/app/features/messaging/components/ConversationSidebar";
import { MessagingWorkspace } from "@/app/features/messaging/components/MessagingWorkspace";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <MessagingWorkspace
      content={<ConversationContent conversationId={conversationId} />}
      mobilePane="content"
      sidebar={<ConversationSidebar />}
    />
  );
}
