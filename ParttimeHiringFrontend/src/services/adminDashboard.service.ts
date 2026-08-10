const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/dashboard';

export interface AdminDashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  newUsersThisMonth: number;
  newEmployersThisMonth: number;
}

export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/stats`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải thống kê');
  const data = await response.json();
  return data.result;
};
