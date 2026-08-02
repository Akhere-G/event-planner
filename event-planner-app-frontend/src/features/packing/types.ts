export interface PackingItem {
  id: number;
  ownerId?: number | null;
  name: string;
  category: string;
  isShared: boolean;
  isChecked: boolean;
  checkedById?: number | null;
  checkedBy?: {
    id: number;
    username: string;
    email: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}
