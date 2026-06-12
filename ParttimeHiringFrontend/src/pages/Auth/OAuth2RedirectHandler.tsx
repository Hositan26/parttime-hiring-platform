import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');

    if (!error) {
      // Backend already set HttpOnly cookie, just navigate to jobs
      navigate('/jobs');
    } else {
      console.error('Lỗi đăng nhập OAuth2:', error);
      navigate('/login', { state: { error: error || 'Đăng nhập Google thất bại' } });
    }
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Đang xác thực thông tin đăng nhập...</h2>
    </div>
  );
};
