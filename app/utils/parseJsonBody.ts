import { ValidationError } from "@/app/lib/errors/ValidationError";

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError({
      body: "Request body must be valid JSON.",
    });
  }
}
