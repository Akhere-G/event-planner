export interface ValidationError {
  status: number;
  data: { error: Record<string, string[]> };
}
