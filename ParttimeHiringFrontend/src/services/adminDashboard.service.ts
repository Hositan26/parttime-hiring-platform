import { apiFetch, apiBase } from './apiClient';
const API_URL = apiBase + '/admin/dashboard';

export interface AdminDashboardStats {
  pendingVerifications: number;
  pendingStores: number;
  pendingReports: number;
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  newUsersThisMonth: number;
  newEmployersThisMonth: number;
}

export const getDashboardStats = async () => {
  const response = await apiFetch(`${API_URL}/stats`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải thống kê');
  const data = await response.json();
  return data.result;
};
