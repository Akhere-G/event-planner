export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const UserRole = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
};
