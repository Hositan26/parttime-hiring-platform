const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/users';

export interface AdminUserResponse {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  dateOfBirth: string;
  roles: string[];
  isActive: boolean;
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

export const banUser = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}/ban`, {
    method: 'PUT',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to ban user');
  const data = await response.json();
  return data.result;
};

export const unbanUser = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}/unban`, {
    method: 'PUT',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to unban user');
  const data = await response.json();
  return data.result;
};
