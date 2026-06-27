import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(errors: Record<string, string>) {
    super("Validation failed.", 400, errors);
  }
}
