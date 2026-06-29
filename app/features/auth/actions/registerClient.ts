import {
  RegisterError,
  RegisterRequest,
  RegisterSuccessResponse,
} from "../types/register.types";

export const handleSubmit = async (
  formData: RegisterRequest,
): Promise<RegisterSuccessResponse | RegisterError> => {
  try {
    const res = await fetch("/api/auth/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    return res.json();
  } catch (error) {
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
};
