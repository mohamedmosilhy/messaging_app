import { prisma } from "@/app/lib/prisma";
import {
  PublicProfileResponse,
  publicProfileSelect,
} from "../types/user-profile.types";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";

export async function getUserProfile(
  username: string,
): Promise<PublicProfileResponse> {
  const usernameNormalized = username.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: usernameNormalized },
    select: publicProfileSelect,
  });

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  return { success: true, data: user };
}
