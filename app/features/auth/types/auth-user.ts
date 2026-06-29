export interface VerifyCredentialsRequest {
  email: string;
  password: string;
}

export interface VerifyCredentialsResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}
