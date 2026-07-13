export interface EmployerProfileResponse {
  employerId: number;
  companyName: string;
  businessType: string;
  emailContact: string;
  phoneContact: string;
  description: string;
  website: string;
  taxCode: string;
  representativeName: string;
  status: string;
  createdAt: string;
  storeFrontImageUrl?: string;
  businessLicenseUrl?: string;
  websiteFanpageUrl?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  verificationStatus?: string;
}

export interface EmployerProfileUpdateRequest {
  businessType?: string;
  emailContact?: string;
  phoneContact?: string;
  description?: string;
  website?: string;
  representativeName?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/parttime_hiring_platform/api';
const API_URL = `${API_BASE_URL}/v1/employer/me/profile`;

export const getEmployerProfile = async (): Promise<EmployerProfileResponse> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  const data = await response.json();
  return data.result;
};

export const updateEmployerProfile = async (data: EmployerProfileUpdateRequest): Promise<EmployerProfileResponse> => {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  const responseData = await response.json();
  return responseData.result;
};
