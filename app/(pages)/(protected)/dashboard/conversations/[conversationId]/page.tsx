import { ConversationContent } from "@/app/features/messaging";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <section className="flex h-screen">
      <main className="flex-1 p-4">
        <h2 className="text-lg font-bold mb-4">Conversation Details</h2>
        <ConversationContent conversationId={conversationId} />
      </main>
    </section>
  );
}
