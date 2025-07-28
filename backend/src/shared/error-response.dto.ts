export class ErrorResponse {
  success = false;
  message: string;

  constructor(message: string) {
    this.message = message;
  }
} 