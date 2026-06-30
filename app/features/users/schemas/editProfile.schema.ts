import * as z from "zod";

export const EditProfileValidation = z
  .object({
    bio: z
      .string()
      .trim()
      .max(160, "Bio cannot exceed 160 characters")
      .optional(),

    displayName: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(50, "Display name cannot exceed 50 characters")
      .optional(),

    avatarUrl: z.string().optional(),
  })
  .strict();
