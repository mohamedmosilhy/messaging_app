import { ValidationError } from "@/app/lib/errors/ValidationError";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";
import { prisma } from "@/app/lib/prisma";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import type {
  BlockStatusResponse,
  GetBlockedUsersResponse,
} from "../types/blocking.types";

const blockedUserSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
} as const;

// this function checks if the target user is valid for blocking/unblocking operations. It ensures that the current user is not trying to block themselves and that the target user exists in the database. If either condition fails, it throws an appropriate error.
async function requireValidTarget(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) {
    throw new ValidationError({
      targetUserId: "You cannot block yourself.",
    });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!target) {
    throw new NotFoundError("User not found.");
  }
}

// this function enforces a rate limit on blocking/unblocking operations for the current user. It uses the enforceRateLimit function to check if the user has exceeded the allowed number of blocking mutations within a specified time window. If the limit is exceeded, it throws a TooManyRequestsError.

async function enforceBlockingMutationLimit(currentUserId: string) {
  await enforceRateLimit({
    scope: "blocking-mutation",
    identifier: currentUserId,
    ...rateLimits.blockingMutation,
  });
}

// this function retrieves the list of users that the current user has blocked. It queries the database for all block records where the current user is the blocker, and returns a list of blocked users along with the timestamp of when they were blocked.
export async function getBlockedUsers(): Promise<GetBlockedUsersResponse> {
  const currentUserId = await requireCurrentUserId();
  const blocks = await prisma.block.findMany({
    where: { blockerId: currentUserId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      blocked: { select: blockedUserSelect },
    },
  });

  return {
    success: true,
    data: {
      users: blocks.map(({ blocked, createdAt }) => ({
        ...blocked,
        blockedAt: createdAt.toISOString(),
      })),
    },
  };
}

// this function retrieves the block status between the current user and a specified target user. It checks if the current user has blocked the target user, if the target user has blocked the current user, and whether they can interact with each other. The function returns an object containing the block status information.
export async function getBlockStatus(
  targetUserId: string,
): Promise<BlockStatusResponse> {
  const currentUserId = await requireCurrentUserId();
  await requireValidTarget(currentUserId, targetUserId);

  const relationships = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: currentUserId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: currentUserId },
      ],
    },
    select: { blockerId: true },
  });

  return {
    success: true,
    data: {
      targetUserId,
      isBlockedByCurrentUser: relationships.some(
        (relationship) => relationship.blockerId === currentUserId,
      ),
      canInteract: relationships.length === 0,
    },
  };
}

// this function allows the current user to block a specified target user. It first checks if the current user is allowed to perform blocking operations by enforcing a rate limit. Then, it validates the target user to ensure they exist and are not the same as the current user. If all checks pass, it creates or updates a block record in the database and returns the updated block status.
export async function blockUser(
  targetUserId: string,
): Promise<BlockStatusResponse> {
  const currentUserId = await requireCurrentUserId();
  await enforceBlockingMutationLimit(currentUserId);
  await requireValidTarget(currentUserId, targetUserId);

  await prisma.block.upsert({
    where: {
      blockerId_blockedId: {
        blockerId: currentUserId,
        blockedId: targetUserId,
      },
    },
    create: { blockerId: currentUserId, blockedId: targetUserId },
    update: {},
  });

  return {
    success: true,
    data: {
      targetUserId,
      isBlockedByCurrentUser: true,
      canInteract: false,
    },
  };
}

// this function allows the current user to unblock a specified target user. Similar to the blockUser function, it enforces a rate limit and validates the target user. If the checks pass, it deletes the block record from the database and checks if the target user has blocked the current user. It then returns the updated block status.
export async function unblockUser(
  targetUserId: string,
): Promise<BlockStatusResponse> {
  const currentUserId = await requireCurrentUserId();
  await enforceBlockingMutationLimit(currentUserId);
  await requireValidTarget(currentUserId, targetUserId);

  await prisma.block.deleteMany({
    where: { blockerId: currentUserId, blockedId: targetUserId },
  });

  const reverseBlock = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: targetUserId,
        blockedId: currentUserId,
      },
    },
    select: { blockerId: true },
  });

  return {
    success: true,
    data: {
      targetUserId,
      isBlockedByCurrentUser: false,
      canInteract: reverseBlock === null,
    },
  };
}
