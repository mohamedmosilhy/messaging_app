import { prisma } from "@/app/lib/prisma";
import {
  CurrentUserResponse,
  currentUserSelect,
} from "../types/current-user.types";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const userId = await requireCurrentUserId();

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: currentUserSelect,
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return {
    success: true,
    data: user,
  };
}
