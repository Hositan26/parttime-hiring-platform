import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Trích xuất token từ tham số URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      // Chuyển hướng đến trang chính
      navigate('/jobs');
    } else {
      // Nếu có lỗi (ví dụ error=access_denied), hiển thị hoặc chuyển về trang login
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
