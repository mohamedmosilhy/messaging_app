import { SendMessageResponse } from "../types/messages.types";

export async function sendMessageRequest({
  conversationId,
  clientId,
  content,
}: {
  conversationId: string;
  clientId: string;
  content: string;
}): Promise<SendMessageResponse> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      content,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Failed to send message.");
  }

  return res.json() as Promise<SendMessageResponse>;
}
