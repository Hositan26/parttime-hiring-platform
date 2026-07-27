const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/employers';

export interface AdminEmployerResponse {
  employerId: number;
  companyName: string;
  representativeName: string;
  emailContact: string;
  phoneContact: string;
  website: string;
  status: string;
  userId: number;
  username: string;
}

export const getEmployers = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch employers');
  }
  
  const data = await response.json();
  return data.result;
};

export const updateEmployerStatus = async (id: number, status: string) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi cập nhật trạng thái');
  }
  
  return await response.json();
};
