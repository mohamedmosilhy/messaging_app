import { NextRequest, NextResponse } from "next/server";

import { login, LoginValidation } from "@/app/features/auth/index";
import { AppError } from "@/app/lib/errors/AppError";
import { formatZodErrors } from "@/app/utils/formatZodErrors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const zodObject = LoginValidation.safeParse(body);

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
    }

    const res = await login(zodObject.data);
    return NextResponse.json(res, { status: 200 });
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
