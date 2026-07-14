import { getMessages } from "@/app/features/messaging";
import { AppError } from "@/app/lib/errors/AppError";
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
    const { conversationId } = await params;

    const searchParams = request.nextUrl.searchParams;

    const parsedLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 20;

    const cursorId = searchParams.get("cursorId");
    const cursorCreatedAt = searchParams.get("cursorCreatedAt");

    const cursor =
      cursorId && cursorCreatedAt
        ? {
            id: cursorId,
            createdAt: cursorCreatedAt,
          }
        : undefined;

    const res = await getMessages({
      conversationId,
      limit,
      cursor,
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
