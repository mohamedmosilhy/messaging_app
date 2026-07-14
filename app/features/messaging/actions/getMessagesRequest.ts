export async function getMessagesRequest({
  conversationId,
  cursor,
  limit,
}: {
  conversationId: string;
  cursor?: {
    id: string;
    createdAt: string;
  };
  limit: number;
}) {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (cursor) {
    params.set("cursorId", cursor.id);
    params.set("cursorCreatedAt", cursor.createdAt);
  }

  const res = await fetch(
    `/api/conversations/${conversationId}/messages?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error("Failed to load messages.");
  }

  return res.json();
}
