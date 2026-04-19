export interface Invite {
  id: number;
  itineraryId: number;
  email: string;
  inviterId: number;
  role: string;
  status: string;
  token?: string;
  expires_at: string;
}
