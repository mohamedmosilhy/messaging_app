import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { searchUsers } from "@/app/features/users";
import { SearchUsersQueryValidation } from "@/app/features/users/schemas/searchUsers.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = SearchUsersQueryValidation.safeParse({
      query: searchParams.get("query") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      throw new ValidationError(formatZodErrors(parsed.error));
    }

    const res = await searchUsers(parsed.data);

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
