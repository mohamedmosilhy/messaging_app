"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  blockUserRequest,
  getBlockedUsersRequest,
  getBlockStatusRequest,
  unblockUserRequest,
} from "../actions/blockingRequest";
import type { BlockStatusResponse } from "../types/blocking.types";

const blockingKeys = {
  all: ["blocking"] as const,
  list: ["blocking", "list"] as const,
  status: (targetUserId: string) =>
    ["blocking", "status", targetUserId] as const,
};

export function useBlockedUsers() {
  return useQuery({
    queryKey: blockingKeys.list,
    queryFn: getBlockedUsersRequest,
  });
}

export function useBlockStatus(
  targetUserId?: string,
  initialData?: BlockStatusResponse,
) {
  return useQuery({
    queryKey: blockingKeys.status(targetUserId ?? "unavailable"),
    queryFn: () => getBlockStatusRequest(targetUserId!),
    enabled: Boolean(targetUserId),
    initialData,
  });
}

export function useBlockingMutation(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shouldBlock: boolean) =>
      shouldBlock
        ? blockUserRequest(targetUserId)
        : unblockUserRequest(targetUserId),
    onMutate: async (shouldBlock) => {
      await queryClient.cancelQueries({
        queryKey: blockingKeys.status(targetUserId),
      });
      const previous = queryClient.getQueryData<BlockStatusResponse>(
        blockingKeys.status(targetUserId),
      );

      if (shouldBlock) {
        queryClient.setQueryData<BlockStatusResponse>(
          blockingKeys.status(targetUserId),
          {
            success: true,
            data: {
              targetUserId,
              isBlockedByCurrentUser: true,
              canInteract: false,
            },
          },
        );
      }

      return { previous };
    },
    onError: (_error, _shouldBlock, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          blockingKeys.status(targetUserId),
          context.previous,
        );
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData<BlockStatusResponse>(
        blockingKeys.status(targetUserId),
        response,
      );
      void queryClient.invalidateQueries({ queryKey: blockingKeys.list });
      void queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
}
