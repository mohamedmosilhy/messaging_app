"use client";

import { useCallback, useSyncExternalStore } from "react";

const DRAFT_EVENT = "relay:draft-change";

export function useConversationDraft(conversationId: string) {
  const storageKey = `relay:draft:${conversationId}`;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === storageKey) onStoreChange();
      };
      const handleLocalChange = (event: Event) => {
        if (
          event instanceof CustomEvent &&
          event.detail?.storageKey === storageKey
        ) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(DRAFT_EVENT, handleLocalChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(DRAFT_EVENT, handleLocalChange);
      };
    },
    [storageKey],
  );

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? "",
    [storageKey],
  );
  const content = useSyncExternalStore(subscribe, getSnapshot, () => "");

  const setContent = useCallback(
    (value: string) => {
      if (value) {
        window.localStorage.setItem(storageKey, value);
      } else {
        window.localStorage.removeItem(storageKey);
      }

      window.dispatchEvent(
        new CustomEvent(DRAFT_EVENT, { detail: { storageKey } }),
      );
    },
    [storageKey],
  );

  return [content, setContent] as const;
}
