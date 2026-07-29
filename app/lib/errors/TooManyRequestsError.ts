import { AppError } from "./AppError";

export class TooManyRequestsError extends AppError {
  constructor(public readonly retryAfterSeconds: number) {
    super("Too many requests. Please wait and try again.", 429);
  }
}
