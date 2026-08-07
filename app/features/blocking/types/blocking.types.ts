export type BlockStatus = {
  targetUserId: string;
  isBlockedByCurrentUser: boolean;
  canInteract: boolean;
};

export type BlockStatusResponse = {
  success: true;
  data: BlockStatus;
};

export type BlockedUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  blockedAt: string;
};

export type GetBlockedUsersResponse = {
  success: true;
  data: {
    users: BlockedUser[];
  };
};

export type BlockingError = {
  success: false;
  message: string;
  errors?: Record<string, string>;
  requestId?: string;
};
