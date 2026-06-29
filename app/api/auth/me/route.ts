import { NextResponse } from "next/server";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";
import { AppError } from "@/app/lib/errors/AppError";

export async function GET() {
  try {
    const userId = await requireCurrentUserId();

    return NextResponse.json({
      success: true,
      userId,
    });
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
