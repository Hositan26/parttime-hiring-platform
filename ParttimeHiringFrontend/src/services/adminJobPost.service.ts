export const JobStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED'
} as const;

export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];

const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/jobs';

export interface AdminJobPostResponse {
  jobId: number;
  title: string;
  storeName: string;
  address: string;
  employerName: string;
  salaryMin: number;
  salaryMax: number;
  headcount: number;
  expiredAt: string;
  status: JobStatusType;
}

export interface AdminJobPostListResponse {
  content: AdminJobPostResponse[];
  totalPages: number;
  totalElements: number;
}

export const getAdminJobPosts = async (status: JobStatusType, page: number = 0, size: number = 10): Promise<AdminJobPostListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Lỗi tải danh sách tin tuyển dụng');
  }
  
  return await response.json().then(res => res.result);
};

export const updateAdminJobPostStatus = async (jobId: number, status: JobStatusType) => {
  const response = await fetch(`${API_URL}/${jobId}/status`, {
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
