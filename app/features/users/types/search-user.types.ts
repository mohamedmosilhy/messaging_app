export type PublicProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

export type SearchUsersRequest = {
  query: string;
  limit: number;
  cursor?: string;
};

export type SearchUsersResponse = {
  success: true;
  data: {
    users: PublicProfile[];
    nextCursor: string | null;
  };
};
