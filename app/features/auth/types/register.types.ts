export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterSuccessResponse {
  success: true;
  message: string;
}

export interface RegisterError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
