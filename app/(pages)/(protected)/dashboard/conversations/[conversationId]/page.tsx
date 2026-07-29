import { ConversationContent } from "@/app/features/messaging";
import { ConversationSidebar } from "@/app/features/messaging/components/ConversationSidebar";
import { MessagingWorkspace } from "@/app/features/messaging/components/MessagingWorkspace";
import { MobileConversationHeader } from "@/app/features/messaging/components/MobileConversationHeader";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <MessagingWorkspace
      content={
        <div className="flex h-full min-h-0 flex-col">
          <MobileConversationHeader />
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ConversationContent conversationId={conversationId} />
          </div>
        </div>
      }
      mobilePane="content"
      sidebar={<ConversationSidebar />}
    />
  );
}
