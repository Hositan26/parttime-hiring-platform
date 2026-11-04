import { createContext, useContext } from 'react';

export interface AuthUser {
  userId: number;
  username: string;
  roles: string[];
  displayName: string;
  email?: string;
  avatarUrl?: string;
}
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}
export const AuthContext = createContext<AuthState | null>(null);

// Reads account state without storing authentication credentials in JavaScript.
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
};
