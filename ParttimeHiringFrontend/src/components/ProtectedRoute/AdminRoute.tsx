import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getMe } from '../../services/auth.service';

export const AdminRoute: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getMe();
        if (user && user.roles && user.roles.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ color: 'var(--primary)' }}>Đang xác thực quyền truy cập...</div>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};
