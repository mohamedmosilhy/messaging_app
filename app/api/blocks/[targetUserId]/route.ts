import { NextRequest, NextResponse } from "next/server";

import { getBlockStatus, unblockUser } from "@/app/features/blocking";
import { BlockTargetParamsValidation } from "@/app/features/blocking/schemas/blocking.schema";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import { formatZodErrors } from "@/app/utils/formatZodErrors";

type RouteContext = {
  params: Promise<{ targetUserId: string }>;
};

async function parseTargetId(context: RouteContext) {
  const parsed = BlockTargetParamsValidation.safeParse(await context.params);

  if (!parsed.success) {
    throw new ValidationError(formatZodErrors(parsed.error));
  }

  return parsed.data.targetUserId;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    return NextResponse.json(
      await getBlockStatus(await parseTargetId(context)),
    );
  } catch (error) {
    return routeErrorResponse(error, request, "blocking.status_failed");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    return NextResponse.json(await unblockUser(await parseTargetId(context)));
  } catch (error) {
    return routeErrorResponse(error, request, "blocking.delete_failed");
  }
}
