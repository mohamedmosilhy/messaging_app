import { NextRequest, NextResponse } from "next/server";

import { register, RegisterValidation } from "@/app/features/auth/index";
import { AppError } from "@/app/lib/errors/AppError";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (session) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already authenticated.",
        },
        {
          status: 403,
        },
      );
    }
    const body = await req.json();
    console.log("body", body);

    const zodObject = RegisterValidation.safeParse(body);

    if (!zodObject.success) {
      const formattedErrors = formatZodErrors(zodObject.error);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: formattedErrors,
        },
        { status: 400 },
      );
    } else {
      const res = await register(zodObject.data);
      return NextResponse.json(res, { status: 201 });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        {
          status: error.statusCode,
        },
      );
    }
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 },
    );
  }
}
