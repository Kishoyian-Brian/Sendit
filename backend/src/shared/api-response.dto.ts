export class ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;

  constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export { PaginatedResponse } from './paginated-response.dto'; 