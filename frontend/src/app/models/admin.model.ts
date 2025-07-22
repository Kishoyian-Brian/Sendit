export interface Admin {
  id: string;
  username?: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  lastLogin?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
} 