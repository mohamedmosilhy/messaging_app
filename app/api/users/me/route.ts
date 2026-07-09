import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { editProfile, getCurrentUser } from "@/app/features/users";
import { EditProfileValidation } from "@/app/features/users/schemas/editProfile.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";

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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = EditProfileValidation.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data.",
          errors: formatZodErrors(parsed.error),
        },
        { status: 400 },
      );
    }

    const res = await editProfile(parsed.data);

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
