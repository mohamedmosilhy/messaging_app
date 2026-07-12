export async function getConversationRequest(conversationId: string) {
  const res = await fetch(`/api/conversations/${conversationId}`);

  if (!res.ok) {
    throw new Error("Failed to load conversation.");
  }

  return res.json();
}
