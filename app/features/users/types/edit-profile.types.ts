import { PublicProfile } from "./search-user.types";

export type EditProfileRequest = {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
};

export type EditProfileResponse = {
  success: true;
  data: PublicProfile;
};
