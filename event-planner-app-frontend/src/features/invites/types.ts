export interface Invite {
  id: number;
  itinerary_id: number;
  email: string;
  inviter_id: number;
  role: string;
  status: string;
  token?: string;
  expires_at: string;
}
