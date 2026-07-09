import {
  EditProfileError,
  EditProfileRequest,
  EditProfileResponse,
} from "../types/edit-profile.types";

export const submitEditProfile = async (
  formData: EditProfileRequest,
): Promise<EditProfileResponse | EditProfileError> => {
  try {
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        message: errorData.message || "An error occurred. Please try again.",
        errors: errorData.errors || {},
      };
    }

    return res.json();
  } catch (error) {
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
};
