import { apiFetch, apiBase } from './apiClient';
export const JobStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED'
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];

const API_URL = apiBase + '/admin/jobs';

export interface AdminJobPostResponse {
  jobId: number;
  title: string;
  storeName: string;
  address: string;
  companyName: string;
  description: string;
  requirements: string;
  benefits: string;
  hourlyWageMin: number;
  hourlyWageMax: number;
  vacancyCount: number;
  expiredAt: string;
  status: JobStatusType;
}

export interface AdminJobPostListResponse {
  content: AdminJobPostResponse[];
  totalPages: number;
  totalElements: number;
}

export const getAdminJobPosts = async (status: JobStatusType | '', page: number = 0, size: number = 10, query = ''): Promise<AdminJobPostListResponse> => {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    size: size.toString()
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await apiFetch(`${API_URL}?${params.toString()}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Lỗi tải danh sách tin tuyển dụng');
  }
  
  return await response.json().then(res => res.result);
};

export const updateAdminJobPostStatus = async (jobId: number, status: JobStatusType) => {
  const response = await apiFetch(`${API_URL}/${jobId}/status`, {
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
  
  const data = await response.json();
  return data.result;
};

export const getAdminJobDetail = async (id: number): Promise<AdminJobPostResponse> => {
  const response = await apiFetch(`${API_URL}/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Không tải được chi tiết');
  return data.result;
};
