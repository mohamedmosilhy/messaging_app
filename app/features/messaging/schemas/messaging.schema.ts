import * as z from "zod";

export const ResourceIdValidation = z
  .string({ error: "Resource ID is required." })
  .trim()
  .min(1, "Resource ID is required.")
  .max(64, "Resource ID is invalid.")
  .regex(/^[a-zA-Z0-9_-]+$/, "Resource ID is invalid.");

export const ConversationParamsValidation = z.object({
  conversationId: ResourceIdValidation,
});

export const OpenConversationValidation = z
  .object({
    targetUserId: ResourceIdValidation,
  })
  .strict();

export const SendMessageValidation = z
  .object({
    clientId: z.uuid({ error: "Client message ID must be a valid UUID." }),
    content: z
      .string({ error: "Message content is required." })
      .trim()
      .min(1, "Message content is required.")
      .max(1000, "Message content cannot exceed 1,000 characters."),
  })
  .strict();

export const MessagesQueryValidation = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursorId: ResourceIdValidation.optional(),
    cursorCreatedAt: z.iso.datetime({ offset: true }).optional(),
  })
  .superRefine((value, context) => {
    const hasCursorId = Boolean(value.cursorId);
    const hasCursorTime = Boolean(value.cursorCreatedAt);

    if (hasCursorId !== hasCursorTime) {
      context.addIssue({
        code: "custom",
        message: "Both cursorId and cursorCreatedAt are required.",
        path: ["cursor"],
      });
    }
  });
