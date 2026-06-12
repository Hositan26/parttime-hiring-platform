const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/v1/employer/dashboard';

export const getDashboardOverview = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');

  const response = await fetch(`${API_URL}/overview`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard overview');
  }

  return await response.json();
};
