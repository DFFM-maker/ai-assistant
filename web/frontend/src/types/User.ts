export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  email?: string;
  accessToken?: string;
  role?: 'admin' | 'user';
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
}