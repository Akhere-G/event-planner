import type { User } from "../auth/types";
import type { Invite } from "../invites/types";

export interface Trip {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  userMemberships: User[];
  events: Event[];
  invites: Invite[];
}
