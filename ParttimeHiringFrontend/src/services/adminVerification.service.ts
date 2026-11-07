import { apiFetch, apiBase } from './apiClient';
const API_URL = apiBase + '/admin/verifications';

export interface VerificationListResponse {
  verificationId: number;
  userId: number;
  username: string;
  companyName: string;
  taxCode: string;
  submittedAt: string;
  status: string;
}

export interface VerificationDetailResponse {
  verificationId: number;
  userId: number;
  username: string;
  email: string;
  contactEmail: string;
  phoneContact: string;
  address: string;
  companyName: string;
  representativeName: string;
  taxCode: string;
  websiteFanpageUrl: string;
  rejectionReason?: string;
  storeFrontImageUrl: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  businessLicenseUrl: string;
  status: string;
  submittedAt: string;
}

export const getVerifications = async (status = 'PENDING', page = 0, size = 10, query = '') => {
  const response = await apiFetch(`${API_URL}?status=${status}&page=${page}&size=${size}&query=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch verifications');
  }
  
  const data = await response.json();
  return data.result; // Trả về Page obj: { content, totalElements, ... }
};

export const getVerificationDetail = async (id: number): Promise<VerificationDetailResponse> => {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch detail');
  }
  
  const data = await response.json();
  return data.result;
};

export const approveVerification = async (id: number) => {
  const response = await apiFetch(`${API_URL}/${id}/approve`, {
    method: 'POST',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi duyệt hồ sơ');
  }
  
  return await response.json();
};

export const rejectVerification = async (id: number, reason: string) => {
  const response = await apiFetch(`${API_URL}/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi từ chối hồ sơ');
  }
  
  return await response.json();
};
