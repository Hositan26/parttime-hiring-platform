import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { AuthUser } from './authContext';
import { getMe } from '../services/auth.service';

// Synchronizes public account details with server-managed authentication cookies.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await getMe());
    } catch (failure) {
      setUser(null);
      setError(failure instanceof Error ? failure.message : 'Could not load account');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    const expire = () => { setUser(null); setLoading(false); };
    window.addEventListener('auth:expired', expire);
    window.addEventListener('auth:changed', reload);
    return () => {
      window.removeEventListener('auth:expired', expire);
      window.removeEventListener('auth:changed', reload);
    };
  }, [reload]);
  return <AuthContext.Provider value={{ user, loading, error, reload }}>{children}</AuthContext.Provider>;
};
