import * as z from "zod";

import { ResourceIdValidation } from "@/app/features/messaging/schemas/messaging.schema";

export const MarkConversationReadValidation = z
  .object({
    messageId: ResourceIdValidation,
  })
  .strict();

export const RealtimeQueryValidation = z.object({
  since: z.iso.datetime({ offset: true }).optional(),
  lastEventId: z.uuid().optional(),
});
