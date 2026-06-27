import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(errors: Record<string, string>) {
    super("Conflict.", 409, errors);
  }
}
