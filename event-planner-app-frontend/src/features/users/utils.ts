import { Eye, Pen, ShieldCheck } from "lucide-react";
import { UserRole, type UserRoleType } from "./types";

const avatarColors = [
  "#0D9488",
  "#E11D48",
  "#4F46E5",
  "#D97706",
  "#16A34A",
  "#9333EA",
  "#2563EB",
  "#B45309",
  "#4B5563",
  "#F43F5E",
];

export const getAvatarColor = (userId: number) => {
  return avatarColors[userId % avatarColors.length];
};

export const isAdmin = (role: string) => role === UserRole.ADMIN;

export const canUserEdit = (role: string) =>
  ([UserRole.ADMIN, UserRole.EDITOR] as UserRoleType[]).includes(
    role as UserRoleType,
  );

export const RoleIcons = {
  [UserRole.ADMIN]: ShieldCheck,
  [UserRole.EDITOR]: Pen,
  [UserRole.VIEWER]: Eye,
};
