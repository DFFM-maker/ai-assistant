export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  accessToken?: string;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
}