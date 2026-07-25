import { ConversationList } from "@/app/features/messaging";

export default async function ConversationListPage() {
  return (
    <section className="flex h-screen">
      <ConversationList />
    </section>
  );
}
