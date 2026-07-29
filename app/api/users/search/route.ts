import { NextRequest, NextResponse } from "next/server";

import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
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
    return routeErrorResponse(error, request, "user.search_failed");
  }
}
