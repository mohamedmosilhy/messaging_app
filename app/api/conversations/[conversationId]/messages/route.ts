import { getMessages } from "@/app/features/messaging";
import { sendMessage } from "@/app/features/messaging/services/sendMessage.service";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import {
  ConversationParamsValidation,
  MessagesQueryValidation,
  SendMessageValidation,
} from "@/app/features/messaging/schemas/messaging.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      conversationId: string;
    }>;
  },
) {
  try {
    const parsedParams = ConversationParamsValidation.safeParse(await params);

    if (!parsedParams.success) {
      throw new ValidationError(formatZodErrors(parsedParams.error));
    }

    const searchParams = request.nextUrl.searchParams;
    const parsedQuery = MessagesQueryValidation.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursorId: searchParams.get("cursorId") ?? undefined,
      cursorCreatedAt: searchParams.get("cursorCreatedAt") ?? undefined,
    });

    if (!parsedQuery.success) {
      throw new ValidationError(formatZodErrors(parsedQuery.error));
    }

    const cursor =
      parsedQuery.data.cursorId && parsedQuery.data.cursorCreatedAt
        ? {
            id: parsedQuery.data.cursorId,
            createdAt: parsedQuery.data.cursorCreatedAt,
          }
        : undefined;

    const res = await getMessages({
      conversationId: parsedParams.data.conversationId,
      limit: parsedQuery.data.limit,
      cursor,
    });

    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, request, "message.history_failed");
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ conversationId: string }>;
  },
) {
  try {
    const parsedParams = ConversationParamsValidation.safeParse(await params);

    if (!parsedParams.success) {
      throw new ValidationError(formatZodErrors(parsedParams.error));
    }

    const body = await parseJsonBody(request);
    const parsedBody = SendMessageValidation.safeParse(body);

    if (!parsedBody.success) {
      throw new ValidationError(formatZodErrors(parsedBody.error));
    }

    const res = await sendMessage({
      conversationId: parsedParams.data.conversationId,
      clientId: parsedBody.data.clientId,
      content: parsedBody.data.content,
    });
    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, request, "message.send_failed");
  }
}
