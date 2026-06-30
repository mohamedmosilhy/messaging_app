import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  SearchUsersRequest,
  SearchUsersResponse,
} from "../types/search-user.types";
import { publicProfileSelect } from "../types/user-profile.types";
import { prisma } from "@/app/lib/prisma";
import { ValidationError } from "@/app/lib/errors/ValidationError";

export async function searchUsers(
  req: SearchUsersRequest,
): Promise<SearchUsersResponse> {
  const currUserId = await requireCurrentUserId();

  const normalizedQuery = req.query.trim().toLowerCase();
  const limit = Math.max(1, Math.min(req.limit ?? 20, 50));

  if (normalizedQuery === "") {
    throw new ValidationError({
      query: "Search query is required.",
    });
  }

  const users = await prisma.user.findMany({
    select: publicProfileSelect,
    where: {
      NOT: {
        id: currUserId,
      },
      blockedByUsers: {
        none: {
          blockerId: currUserId,
        },
      },
      blockedUsers: {
        none: {
          blockedId: currUserId,
        },
      },
      OR: [
        {
          username: {
            startsWith: normalizedQuery,
            mode: "insensitive",
          },
        },
        {
          displayName: {
            startsWith: normalizedQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      username: "asc",
    },
    take: limit + 1,
    ...(req.cursor && {
      cursor: { id: req.cursor },
      skip: 1,
    }),
  });

  const hasNextPage = users.length > limit;

  if (hasNextPage) {
    users.pop();
  }

  return {
    success: true,
    data: {
      users: users,
      nextCursor: hasNextPage ? users[users.length - 1].id : null,
    },
  };
}
