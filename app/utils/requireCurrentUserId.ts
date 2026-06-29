import { auth } from "@/auth";
import { UnauthorizedError } from "../lib/errors/UnauthorizedError";

export async function requireCurrentUserId() {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("Authentication required.");
  }
  return session.user.id;
}
