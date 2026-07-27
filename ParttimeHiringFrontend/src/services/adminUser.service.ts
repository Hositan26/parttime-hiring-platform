const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/users';

export interface AdminUserResponse {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  dateOfBirth: string;
  roles: string[];
}

export const getUsers = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const data = await response.json();
  return data.result;
};
