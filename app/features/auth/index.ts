export { register } from "./services/register.service";

export type {
  RegisterRequest,
  RegisterError,
  RegisterSuccessResponse,
} from "./types/register.types";

export { RegisterValidation } from "./schemas/register.schema";

// ------------------------------------

export { verifyCredentials } from "./services/verify-credentials.service";

export type {
  VerifyCredentialsRequest,
  VerifyCredentialsResponse,
} from "./types/auth-user";

export { LoginValidation } from "./schemas/login.schema";

// ------------------------------------

export { RegisterForm } from "./components/RegisterForm";
