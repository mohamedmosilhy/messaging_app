import { NextRequest, NextResponse } from "next/server";

import { editProfile, getCurrentUser } from "@/app/features/users";
import { EditProfileValidation } from "@/app/features/users/schemas/editProfile.schema";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { parseJsonBody } from "@/app/utils/parseJsonBody";
import { routeErrorResponse } from "@/app/lib/route-response";
import { ValidationError } from "@/app/lib/errors/ValidationError";

export async function GET(request: NextRequest) {
  try {
    const res = await getCurrentUser();

    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, request, "user.current_failed");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await parseJsonBody(req);

    const parsed = EditProfileValidation.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(formatZodErrors(parsed.error));
    }

    const res = await editProfile(parsed.data);

    return NextResponse.json(res);
  } catch (error) {
    return routeErrorResponse(error, req, "user.profile_update_failed");
  }
}
