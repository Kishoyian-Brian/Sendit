export class PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
} 