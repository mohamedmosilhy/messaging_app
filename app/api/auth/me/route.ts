import { NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { getCurrentUser } from "@/app/features/users";

export async function GET() {
  try {
    const res = await getCurrentUser();

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
