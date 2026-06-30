import { PublicProfile } from "./search-user.types";

export type PublicProfileResponse = {
  success: true;
  data: PublicProfile;
};

export const publicProfileSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
} as const;
