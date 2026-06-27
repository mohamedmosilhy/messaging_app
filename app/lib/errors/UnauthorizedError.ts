import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized.", 401);
  }
}
