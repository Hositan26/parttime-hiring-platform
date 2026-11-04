import { apiFetch, apiBase } from './apiClient';
const API_URL = apiBase + '/jobs';

export interface Job {
  id: number;
  title: string;
  store: string;
  location: string;
  salary: string;
  shifts: string[];
  headcount: number;
  date: string;
  status?: string;
}

export interface JobPage {
  content: Job[];
  totalElements: number;
  totalPages: number;
}

export const searchJobPage = async (filters: Record<string, string>, page: number): Promise<JobPage> => {
  const params = new URLSearchParams({ page: String(page), size: '12' });
  Object.entries(filters).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()); });
  const response = await apiFetch(`${API_URL}/page?${params}`);
  if (!response.ok) throw new Error('Không thể tải danh sách việc làm.');
  return (await response.json()).result;
};

export const getJobs = async (): Promise<Job[]> => {
  const response = await apiFetch(API_URL, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data = await response.json();
  return data.result;
};

export const searchJobs = async (filters: any): Promise<Job[]> => {
  const params = new URLSearchParams();
  for (const key in filters) {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  }
  
  const response = await apiFetch(`${API_URL}/search?${params.toString()}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to search jobs');
  }
  const data = await response.json();
  return data.result;
};

export const getCategories = async (): Promise<any[]> => {
  const response = await apiFetch(`${API_URL}/categories`, {
    credentials: 'include'
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.result;
};

export const getShifts = async (): Promise<any[]> => {
  const response = await apiFetch(`${API_URL}/shifts`, {
    credentials: 'include'
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.result;
};

export interface JobDetail {
  id: number;
  title: string;
  company: string;
  storeName: string;
  address: string;
  fullAddress: string;
  wage: string;
  headcount: number;
  gender: string;
  ageRange: string;
  postedDate: string;
  expiredDate: string;
  description: string;
  status?: string;
  requirements: string;
  benefits: string;
  phoneContact: string;
  categories: string[];
  images: string[];
  shifts: string[];
}

export const getJobById = async (id: string | number): Promise<JobDetail> => {
  const response = await apiFetch(`${API_URL}/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch job details');
  }
  const data = await response.json();
  return data.result;
};
