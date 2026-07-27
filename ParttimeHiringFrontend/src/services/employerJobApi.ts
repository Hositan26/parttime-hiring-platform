// Wait, let's check the controller URL. In EmployerJobController, it is `@RequestMapping("/api/employers/jobs")`. So `http://localhost:8088/parttime_hiring_platform/api/employer/jobs`.

export interface EmployerJobCommentDTO {
  reviewId: number;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface EmployerJobApplicantDTO {
  applicationId: number;
  userId: number;
  name: string;
  avatar: string;
  cvUrl: string;
  email: string;
  phone: string;
  appliedDate: string;
  appliedTime: string;
  note: string;
  jobTitle: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface EmployerJobImageDTO {
  imageId: number;
  imageUrl: string;
}

export interface EmployerJobListDTO {
  id: number;
  title: string;
  store: string;
  address: string;
  logo: string;
  salary: string;
  type: string;
  shift: string;
  applicants: number;
  status: string;
  posted: string;
  deadline: string;
  daysLeft: string;
  shiftsList?: string[];
  categoriesList?: string[];
}

export interface EmployerJobDetailDTO {
  id: number;
  title: string;
  store: string;
  storeId: number;
  address: string;
  logo: string;
  status: string;
  salary: string;
  type: string;
  shift: string;
  applicants: number;
  vacancyCount: number;
  deadline: string;
  rawExpiredAt?: string;
  daysLeft: string;
  posted: string;
  description: string;
  requirements: string;
  benefits: string;
  minAge?: number;
  maxAge?: number;
  genderRequirement?: 'ANY' | 'MALE' | 'FEMALE';
  shiftsList: string[];
  shiftIds: number[];
  categoriesList: string[];
  categoryIds: number[];
  images: EmployerJobImageDTO[];
}

export interface CreateEmployerJobRequestDTO {
  title: string;
  storeId: number;
  jobDescription: string;
  requirements?: string;
  benefits?: string;
  hourlyWageMin: number;
  hourlyWageMax?: number;
  currency?: string;
  vacancyCount: number;
  minAge?: number;
  maxAge?: number;
  genderRequirement: string;
  employmentType: string;
  expiredAt: string;
  shiftIds?: number[];
  categoryIds?: number[];
}

export interface UpdateEmployerJobRequestDTO extends Omit<CreateEmployerJobRequestDTO, 'storeId'> {
  status?: string;
}

const getFetchOptions = (method: string = 'GET', body?: any) => {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
};

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data.result;
};

export const getEmployerJobs = async (page: number = 0, size: number = 10, storeId?: number, status?: string) => {
  let url = `http://localhost:8088/parttime_hiring_platform/api/employer/jobs?page=${page}&size=${size}`;
  if (storeId) url += `&storeId=${storeId}`;
  if (status) url += `&status=${status}`;
  const response = await fetch(url, getFetchOptions());
  return handleResponse(response);
};

export const getEmployerStores = async () => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores`, getFetchOptions());
  return handleResponse(response);
};

export const getEmployerJobDetail = async (id: number) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}`, getFetchOptions());
  return handleResponse(response);
};

export const createEmployerJob = async (data: CreateEmployerJobRequestDTO) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs`, getFetchOptions('POST', data));
  return handleResponse(response);
};

export const updateEmployerJob = async (id: number, data: UpdateEmployerJobRequestDTO) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}`, getFetchOptions('PUT', data));
  return handleResponse(response);
};

export const getJobComments = async (id: number) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}/comments`, getFetchOptions());
  return handleResponse(response);
};

export const getJobApplicants = async (id: number) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}/applicants`, getFetchOptions());
  return handleResponse(response);
};

export const uploadJobImage = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return handleResponse(response);
};

export const deleteJobImage = async (id: number, imageId: number) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}/images/${imageId}`, getFetchOptions('DELETE'));
  return handleResponse(response);
};

export const updateJobStatus = async (id: number, status: string) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}/status`, getFetchOptions('PATCH', { status }));
  return handleResponse(response);
};

export const deleteEmployerJob = async (id: number) => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/jobs/${id}`, getFetchOptions('DELETE'));
  return handleResponse(response);
};
