export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
