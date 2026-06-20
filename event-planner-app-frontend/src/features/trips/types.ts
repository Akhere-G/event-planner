import type { User } from "../users/types";
import type { Invite } from "../invites/types";
import type { Event } from "../events/types";

export interface Trip {
  id: number;
  name: string;
  destination: string;
  latitude: number;
  longitude: number;
  role: string;
  description?: string;
  startDate: string;
  endDate: string;
  userMemberships: User[];
  events: Event[];
  invites: Invite[];
  adminCode?: string;
  editorCode?: string;
  viewerCode?: string;
}
