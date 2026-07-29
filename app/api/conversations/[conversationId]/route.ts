import { getConversation } from "@/app/features/messaging";
import { AppError } from "@/app/lib/errors/AppError";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { ConversationParamsValidation } from "@/app/features/messaging/schemas/messaging.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const parsed = ConversationParamsValidation.safeParse(await params);

    if (!parsed.success) {
      throw new ValidationError(formatZodErrors(parsed.error));
    }

    const res = await getConversation({
      conversationId: parsed.data.conversationId,
    });

    return NextResponse.json(res);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 },
    );
  }
}
