export async function sendMessageRequest({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message.");
  }

  return res.json();
}
