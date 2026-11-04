import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { AuthUser } from './authContext';
import { getMe } from '../services/auth.service';

// Synchronizes public account details with server-managed authentication cookies.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const load = useCallback(() => {
    const sequence = ++generation.current;
    return getMe().then(account => {
      if (sequence === generation.current) { setUser(account); setError(null); }
    }).catch(failure => {
      if (sequence === generation.current) {
        setUser(null);
        setError(failure instanceof Error ? failure.message : 'Could not load account');
      }
    }).finally(() => {
      if (sequence === generation.current) setLoading(false);
    });
  }, []);
  const invalidate = useCallback(() => { generation.current++; }, []);
  const reload = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);
  useEffect(() => {
    void load();
    const expire = () => { invalidate(); setUser(null); setLoading(false); };
    window.addEventListener('auth:expired', expire);
    window.addEventListener('auth:changed', reload);
    return () => {
      invalidate();
      window.removeEventListener('auth:expired', expire);
      window.removeEventListener('auth:changed', reload);
    };
  }, [load, reload, invalidate]);
  return <AuthContext.Provider value={{ user, loading, error, reload }}>{children}</AuthContext.Provider>;
};
