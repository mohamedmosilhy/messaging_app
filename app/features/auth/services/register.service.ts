import { prisma } from "@/app/lib/prisma";
import {
  RegisterRequest,
  RegisterSuccessResponse,
} from "../types/register.types";

import "dotenv/config";

import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { ConflictError } from "@/app/lib/errors/ConflictError";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";

export async function register(
  data: RegisterRequest,
  context: { rateLimitIdentifier?: string } = {},
): Promise<RegisterSuccessResponse> {
  // normalize
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase();

  await enforceRateLimit({
    scope: "registration",
    identifier: `${context.rateLimitIdentifier ?? "unknown-client"}:${email}`,
    ...rateLimits.registration,
  });

  // duplicate check
  const [emailRes, usernameRes] = await Promise.all([
    prisma.user.findUnique({ where: { email: email } }),
    prisma.user.findUnique({
      where: { username: username },
    }),
  ]);

  if (emailRes !== null) {
    throw new ConflictError({
      email: "Email already exists.",
    });
  }

  if (usernameRes !== null) {
    throw new ConflictError({
      username: "Username already exists.",
    });
  }

  // hash password
  const passwordHash = await bcrypt.hash(
    data.password,
    parseInt(process.env.HASHING_SALT || "10", 10),
  );

  // create user
  try {
    await prisma.user.create({
      data: {
        email: email,
        username: username,
        passwordHash: passwordHash,
        displayName: data.username.trim(),
      },
    });
  } catch (error) {
    // error returned from prisma if there is a unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];

        if (target.includes("email")) {
          throw new ConflictError({
            email: "Email already exists.",
          });
        }
        if (target.includes("username")) {
          throw new ConflictError({
            username: "Username already exists.",
          });
        }
      }
    }
    throw error;
  }
  return {
    success: true,
    message: "Account created successfully.",
  };
}
