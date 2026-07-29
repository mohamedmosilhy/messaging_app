import { prisma } from "@/app/lib/prisma";

import bcrypt from "bcryptjs";

import {
  VerifyCredentialsResponse,
  VerifyCredentialsRequest,
} from "../types/auth-user";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";

const DUMMY_PASSWORD_HASH =
  "$2b$10$1D48dVuPNP/DzCkpLC7LzuvAGVf6jsCF9EZRjF41YJwLAkndthvn.";

export async function verifyCredentials(
  data: VerifyCredentialsRequest,
  context: { rateLimitIdentifier?: string } = {},
): Promise<VerifyCredentialsResponse> {
  const email = data.email.trim().toLowerCase();

  await enforceRateLimit({
    scope: "authentication",
    identifier: `${context.rateLimitIdentifier ?? "unknown-client"}:${email}`,
    ...rateLimits.authentication,
  });

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const isPasswordMatch = await bcrypt.compare(
    data.password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !isPasswordMatch) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
}
