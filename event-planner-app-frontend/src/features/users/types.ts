export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isDemo?: boolean;
}

export const UserRole = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
