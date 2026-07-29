import { getConversations, openConversation } from "@/app/features/messaging";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import { OpenConversationValidation } from "@/app/features/messaging/schemas/messaging.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBody(req);
    const parsed = OpenConversationValidation.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(formatZodErrors(parsed.error));
    }

    const res = await openConversation(parsed.data);

    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, req, "conversation.open_failed");
  }
}

export async function GET(request: NextRequest) {
  try {
    const res = await getConversations();

    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, request, "conversation.list_failed");
  }
}
