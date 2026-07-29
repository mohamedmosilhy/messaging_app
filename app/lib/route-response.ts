import "server-only";

import { NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { TooManyRequestsError } from "@/app/lib/errors/TooManyRequestsError";
import { logger } from "@/app/lib/logger";

export function routeErrorResponse(
  error: unknown,
  request: Request,
  event: string,
) {
  const requestId = request.headers.get("x-request-id") ?? "unavailable";

  if (error instanceof AppError) {
    const response = NextResponse.json(
      {
        success: false,
        message: error.message,
        ...(error.errors ? { errors: error.errors } : {}),
        requestId,
      },
      { status: error.statusCode },
    );

    if (error instanceof TooManyRequestsError) {
      response.headers.set("Retry-After", String(error.retryAfterSeconds));
    }

    return response;
  }

  logger.error(event, {
    requestId,
    errorName: error instanceof Error ? error.name : "UnknownError",
    ...(process.env.NODE_ENV !== "production" && error instanceof Error
      ? { errorMessage: error.message }
      : {}),
  });

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error.",
      requestId,
    },
    { status: 500 },
  );
}
