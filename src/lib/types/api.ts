// General API type definitions
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}