import { prisma } from "@/app/lib/prisma";

import bcrypt from "bcryptjs";

import {
  VerifyCredentialsResponse,
  VerifyCredentialsRequest,
} from "../types/auth-user";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";

export async function verifyCredentials(
  data: VerifyCredentialsRequest,
): Promise<VerifyCredentialsResponse> {
  const email = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const isPasswordMatch = user
    ? await bcrypt.compare(data.password, user.passwordHash)
    : false;

  if (!user || !isPasswordMatch) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}
