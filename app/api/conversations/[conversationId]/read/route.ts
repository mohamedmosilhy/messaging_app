import { NextRequest, NextResponse } from "next/server";

import { ConversationParamsValidation } from "@/app/features/messaging/schemas/messaging.schema";
import { MarkConversationReadValidation } from "@/app/features/realtime/schemas/realtime.schema";
import { markConversationRead } from "@/app/features/realtime/services/markConversationRead.service";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const parsedParams = ConversationParamsValidation.safeParse(await params);

    if (!parsedParams.success) {
      throw new ValidationError(formatZodErrors(parsedParams.error));
    }

    const parsedBody = MarkConversationReadValidation.safeParse(
      await parseJsonBody(request),
    );

    if (!parsedBody.success) {
      throw new ValidationError(formatZodErrors(parsedBody.error));
    }

    const response = await markConversationRead({
      conversationId: parsedParams.data.conversationId,
      messageId: parsedBody.data.messageId,
    });

    return NextResponse.json(response);
  } catch (error) {
    return routeErrorResponse(error, request, "conversation.read_failed");
  }
}
