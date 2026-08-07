import type { MarkConversationReadResponse } from "../types/realtime.types";

export async function markConversationReadRequest(input: {
  conversationId: string;
  messageId: string;
}): Promise<MarkConversationReadResponse> {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(input.conversationId)}/read`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: input.messageId }),
    },
  );
  const body = (await response.json()) as
    | MarkConversationReadResponse
    | { success: false; message?: string };

  if (!response.ok || !body.success) {
    throw new Error(
      "message" in body && body.message
        ? body.message
        : "The conversation could not be marked as read.",
    );
  }

  return body;
}
