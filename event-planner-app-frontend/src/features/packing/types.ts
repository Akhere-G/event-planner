export interface PackingItem {
  id: number;
  ownerId: number;
  name: string;
  category: string;
  isShared: boolean;
  isChecked: boolean;
  checkedBy: { username: string; email: string };
}
