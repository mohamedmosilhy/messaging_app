import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageRequest } from "../actions/sendMessageRequest";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (content: string) =>
      sendMessageRequest({
        conversationId,
        content,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
