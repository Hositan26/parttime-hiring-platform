import { apiFetch, apiBase } from './apiClient';
const API_URL = apiBase + '/employer/dashboard';

export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp: string;
}

export const getDashboardOverview = async () => {
  const response = await apiFetch(`${API_URL}/overview`, {
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
