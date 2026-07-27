const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/employer/dashboard';

export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp: string;
}

export const getDashboardOverview = async () => {
  const response = await fetch(`${API_URL}/overview`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to fetch dashboard overview');
  }

  const data: ApiResponse<any> = await response.json();
  return data.result;
};
