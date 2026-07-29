import { ConversationEmptyState } from "@/app/features/messaging/components/ConversationEmptyState";
import { ConversationSidebar } from "@/app/features/messaging/components/ConversationSidebar";
import { MessagingWorkspace } from "@/app/features/messaging/components/MessagingWorkspace";

export default function ConversationListPage() {
  return (
    <MessagingWorkspace
      content={<ConversationEmptyState />}
      mobilePane="sidebar"
      sidebar={<ConversationSidebar />}
    />
  );
}
