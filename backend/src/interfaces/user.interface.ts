export type UserRole = 'USER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
