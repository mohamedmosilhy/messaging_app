export async function getConversationsRequest() {
  const res = await fetch(`/api/conversations`);

  if (!res.ok) {
    throw new Error("Failed to load conversations.");
  }

  return res.json();
}
