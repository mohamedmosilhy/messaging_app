import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { searchUsers } from "@/app/features/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const cursor = searchParams.get("cursor") || undefined;
    const parsedLimit = Number(searchParams.get("limit"));
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;

    const res = await searchUsers({ query, cursor, limit });

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
