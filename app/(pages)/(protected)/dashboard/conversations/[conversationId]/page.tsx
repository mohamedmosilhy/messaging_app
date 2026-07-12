import ConversationContent from "@/app/features/messaging/components/ConversationContent";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return <ConversationContent conversationId={conversationId} />;
}
