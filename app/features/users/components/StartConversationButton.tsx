"use client";

import { LoaderCircle, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { openConversationRequest } from "@/app/features/messaging/actions/openConversationRequest";
import { getConversationUrl } from "@/app/utils/getConversationUrl";

export function StartConversationButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string>();

  async function startConversation() {
    if (isOpening) return;

    try {
      setIsOpening(true);
      setError(undefined);
      const result = await openConversationRequest(targetUserId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(getConversationUrl(result.data.conversationId));
    } catch {
      setError("Could not start this conversation.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        className="rounded-xl"
        disabled={isOpening}
        onClick={startConversation}
      >
        {isOpening ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <MessageCircle aria-hidden="true" />
        )}
        {isOpening ? "Opening conversation" : "Send a message"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
