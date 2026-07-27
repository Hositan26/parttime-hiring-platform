const API_URL = 'http://localhost:8088/parttime_hiring_platform/api';

export interface EmployerEmploymentResponse {
  recordId: number;
  userId: number;
  employeeName: string;
  employeeAvatar: string;
  employeePhone: string;
  employeeEmail: string;
  jobPostId: number;
  jobTitle: string;
  storeId: number;
  storeName: string;
  storeAddress: string;
  applicationId: number;
  startDate: string;
  endDate: string;
  workStatus: string;
  note: string;
  createdAt: string;
}

export const getEmployments = async (storeId?: number): Promise<EmployerEmploymentResponse[]> => {

  const url = storeId 
    ? `${API_URL}/employer/employments?storeId=${storeId}` 
    : `${API_URL}/employer/employments`;
    
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch employments');
  }
  
  const data = await response.json();
  return data.result;
};

export const updateEmploymentStatus = async (recordId: number, status: string, note: string): Promise<void> => {
  const response = await fetch(`${API_URL}/employer/employments/${recordId}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, note })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update employment status');
  }
};
