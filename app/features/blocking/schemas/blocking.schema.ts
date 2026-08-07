import * as z from "zod";

const BlockingTargetIdValidation = z
  .string({ error: "User ID is required." })
  .trim()
  .min(1, "User ID is required.")
  .max(64, "User ID is invalid.")
  .regex(/^[a-zA-Z0-9_-]+$/, "User ID is invalid.");

export const BlockUserValidation = z
  .object({
    targetUserId: BlockingTargetIdValidation,
  })
  .strict();

export const BlockTargetParamsValidation = z.object({
  targetUserId: BlockingTargetIdValidation,
});
