const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/auth';

/**
 * Gọi API Đăng ký tài khoản
 */
export const register = async (username: string, password: string, displayName?: string, dateOfBirth?: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, displayName, dateOfBirth }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Đăng ký thất bại');
  }
  return data;
};

/**
 * Gọi API Đăng nhập và lấy JWT token
 */
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Đăng nhập thất bại');
  }
  return data; // Chứa token
};

/**
 * Lấy thông tin user hiện tại
 */
export const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');

  const response = await fetch('http://localhost:8088/parttime_hiring_platform/api/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return await response.json();
};

/**
 * Cập nhật thông tin user hiện tại
 */
export const updateMe = async (data: { 
  displayName?: string; 
  username?: string;
  email?: string;
  dateOfBirth?: string;
  currentPassword?: string;
}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');

  const response = await fetch('http://localhost:8088/parttime_hiring_platform/api/users/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update user');
  }

  return await response.json();
};
