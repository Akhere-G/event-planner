export interface ValidationError {
  status: number;
  data: { error: Record<string, string[]> };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
