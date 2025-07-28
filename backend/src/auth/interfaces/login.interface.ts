export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
