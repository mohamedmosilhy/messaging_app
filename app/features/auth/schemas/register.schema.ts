import * as z from "zod";

export const RegisterValidation = z.object({
  username: z
    .string({ error: "Username is required." })
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: "Only letters, numbers, and underscores allowed.",
    })
    .min(3, { error: "Username must be between 3 and 20 characters." })
    .max(20, { error: "Username must be between 3 and 20 characters." }),

  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password at minimum 8 characters" })
    .regex(/[a-z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),

  email: z
    .string({ error: "Email is required." })
    .trim()
    .pipe(z.email({ error: "Invalid email address." })),
});
