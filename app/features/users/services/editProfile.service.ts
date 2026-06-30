import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import {
  EditProfileRequest,
  EditProfileResponse,
} from "../types/edit-profile.types";
import { ValidationError } from "@/app/lib/errors/ValidationError";

import { prisma } from "@/app/lib/prisma";
import { NotFoundError } from "@/app/lib/errors/NotFoundError";
import { currentUserSelect } from "../types/current-user.types";

export async function editProfile(
  req: EditProfileRequest,
): Promise<EditProfileResponse> {
  const currUserId = await requireCurrentUserId();

  const hasChanges = Object.values(req).some((value) => value !== undefined);

  if (!hasChanges) {
    throw new ValidationError({
      public: "At least one field is required.",
    });
  }

  if (Object.keys(req).length === 0) {
    throw new ValidationError({ public: "An empty request" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: currUserId },
  });

  if (!existingUser) {
    throw new NotFoundError();
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: currUserId,
    },
    select: currentUserSelect,
    data: {
      displayName: req.displayName,
      bio: req.bio,
      avatarUrl: req.avatarUrl,
    },
  });

  return { success: true, data: updatedUser };
}
