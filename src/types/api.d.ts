export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Pagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
