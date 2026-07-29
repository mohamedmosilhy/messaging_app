import { getConversations, openConversation } from "@/app/features/messaging";
import { AppError } from "@/app/lib/errors/AppError";
import { ValidationError } from "@/app/lib/errors/ValidationError";
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

export async function GET() {
  try {
    const res = await getConversations();

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
