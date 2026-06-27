import * as z from "zod";

export const LoginValidation = z
  .object({
    password: z
      .string({ error: "Password is required" })
      .min(8, { error: "Password at minimum 8 characters" }),
    email: z
      .string({ error: "Email is required." })
      .trim()
      .pipe(z.email({ error: "Invalid email address." })),
  })
  .strict();
