import { NextRequest, NextResponse } from "next/server";

import { register, RegisterValidation } from "@/app/features/auth/index";
import { ForbiddenError } from "@/app/lib/errors/ForbiddenError";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { routeErrorResponse } from "@/app/lib/route-response";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";
import { auth } from "@/auth";
import { getClientIdentifier } from "@/app/lib/client-identifier";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (session) {
      throw new ForbiddenError("You are already authenticated.");
    }
    const body = await parseJsonBody(req);

    const zodObject = RegisterValidation.safeParse(body);

    if (!zodObject.success) {
      throw new ValidationError(formatZodErrors(zodObject.error));
    }

    const res = await register(zodObject.data, {
      rateLimitIdentifier: getClientIdentifier(req),
    });
    return NextResponse.json(res, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error, req, "auth.registration_failed");
  }
}
