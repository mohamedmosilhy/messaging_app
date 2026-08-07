import type {
  BlockingError,
  BlockStatusResponse,
  GetBlockedUsersResponse,
} from "../types/blocking.types";

async function parseResponse<T extends object>(response: Response): Promise<T> {
  const result = (await response.json()) as T | BlockingError;

  if (!response.ok) {
    throw new Error(
      "message" in result
        ? result.message
        : "The request could not be completed.",
    );
  }

  return result as T;
}

export async function getBlockedUsersRequest() {
  return parseResponse<GetBlockedUsersResponse>(await fetch("/api/blocks"));
}

export async function getBlockStatusRequest(targetUserId: string) {
  return parseResponse<BlockStatusResponse>(
    await fetch(`/api/blocks/${encodeURIComponent(targetUserId)}`),
  );
}

export async function blockUserRequest(targetUserId: string) {
  return parseResponse<BlockStatusResponse>(
    await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    }),
  );
}

export async function unblockUserRequest(targetUserId: string) {
  return parseResponse<BlockStatusResponse>(
    await fetch(`/api/blocks/${encodeURIComponent(targetUserId)}`, {
      method: "DELETE",
    }),
  );
}
