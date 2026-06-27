import { ZodError } from "zod";

export function formatZodErrors(error: ZodError) {
  const formattedErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0]);

    if (!(field in formattedErrors)) {
      formattedErrors[field] = issue.message;
    }
  }

  return formattedErrors;
}
