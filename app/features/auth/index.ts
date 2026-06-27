export { register } from "./services/register.service";

export type {
  RegisterRequest,
  RegisterError,
  RegisterSuccessResponse,
} from "./types/register.types";

export { RegisterValidation } from "./schemas/register.schema";
