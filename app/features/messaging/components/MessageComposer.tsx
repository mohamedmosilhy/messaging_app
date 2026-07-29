"use client";

import { AlertCircle, LoaderCircle, Send } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/lib/utils";

const MAX_MESSAGE_LENGTH = 1000;

type MessageComposerProps = {
  errorMessage?: string;
  isPending: boolean;
  onSend: (content: string, onSuccess: () => void) => void;
};

export function MessageComposer({
  errorMessage,
  isPending,
  onSend,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedContent = content.trim();
  const isOverLimit = content.length > MAX_MESSAGE_LENGTH;
  const canSend = trimmedContent.length > 0 && !isOverLimit && !isPending;

  function submitMessage(event?: FormEvent) {
    event?.preventDefault();

    if (!canSend) return;

    onSend(trimmedContent, () => {
      setContent("");
      textareaRef.current?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <form
      className="shrink-0 border-t border-white/8 bg-card/65 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-4"
      onSubmit={submitMessage}
    >
      {errorMessage ? (
        <div
          className="mb-2 flex items-center gap-2 text-xs text-destructive"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="size-3.5" />
          <span>{errorMessage} Your message is still here—try again.</span>
        </div>
      ) : null}
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-background/70 p-1.5 shadow-[0_0.75rem_2.5rem_oklch(0_0_0/0.18)] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <label className="sr-only" htmlFor="message-composer">
          Message
        </label>
        <Textarea
          aria-describedby="message-help"
          aria-invalid={isOverLimit || Boolean(errorMessage)}
          className="max-h-36 min-h-9 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
          id="message-composer"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message"
          ref={textareaRef}
          rows={1}
          value={content}
        />
        <Button
          aria-label="Send message"
          className="rounded-xl"
          disabled={!canSend}
          size="icon-lg"
          type="submit"
        >
          {isPending ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Send aria-hidden="true" />
          )}
        </Button>
      </div>
      <div
        className="mt-1.5 flex items-center justify-between px-1 text-[0.7rem] text-muted-foreground"
        id="message-help"
      >
        <span>Enter to send · Shift + Enter for a new line</span>
        <span
          className={cn(
            "tabular-nums",
            isOverLimit && "font-medium text-destructive",
          )}
        >
          {content.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
}
