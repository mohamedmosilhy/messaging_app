import { prisma } from "@/app/lib/prisma";

import bcrypt from "bcryptjs";

import { LoginRequest, LoginSuccessResponse } from "../types/login.types";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";

export async function login(data: LoginRequest): Promise<LoginSuccessResponse> {
  const email = data.email.trim().toLowerCase();

  console.time("findUser");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.timeEnd("findUser");

  console.time("bcrypt");

  const isPasswordMatch = user
    ? await bcrypt.compare(data.password, user.passwordHash)
    : false;

  console.timeEnd("bcrypt");

  if (!user || !isPasswordMatch) {
    throw new UnauthorizedError("Invalid credentials.");
  }
  // TODO: create session

  return {
    success: true,
    message: "Logged in successfully.",
  };
}
