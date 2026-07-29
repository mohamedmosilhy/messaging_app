import * as z from "zod";

import { ResourceIdValidation } from "@/app/features/messaging/schemas/messaging.schema";

export const SearchUsersQueryValidation = z.object({
  query: z
    .string({ error: "Search query is required." })
    .trim()
    .min(1, "Search query is required.")
    .max(80, "Search query is too long."),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: ResourceIdValidation.optional(),
});
