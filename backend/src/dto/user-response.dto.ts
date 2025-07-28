import { UserRole } from '../interfaces/user.interface';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
} 