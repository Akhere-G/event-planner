export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const UserRole = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};
