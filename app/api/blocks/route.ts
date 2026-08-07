import { NextRequest, NextResponse } from "next/server";

import { blockUser, getBlockedUsers } from "@/app/features/blocking";
import { BlockUserValidation } from "@/app/features/blocking/schemas/blocking.schema";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getBlockedUsers());
  } catch (error) {
    return routeErrorResponse(error, request, "blocking.list_failed");
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = BlockUserValidation.safeParse(await parseJsonBody(request));

    if (!parsed.success) {
      throw new ValidationError(formatZodErrors(parsed.error));
    }

    return NextResponse.json(await blockUser(parsed.data.targetUserId));
  } catch (error) {
    return routeErrorResponse(error, request, "blocking.create_failed");
  }
}
