export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  pagination?: {
    currentPage: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  data: T;
}

export interface Pagination {
  currentPage?: number;
  itemsPerPage?: number;
  totalPages?: number;
  totalItems?: number;
  totalRecords?:number;
}
