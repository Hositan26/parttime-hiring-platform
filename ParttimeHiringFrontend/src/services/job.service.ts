const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/jobs';

export interface Job {
  id: number;
  title: string;
  store: string;
  location: string;
  salary: string;
  shifts: string[];
  headcount: number;
  date: string;
}

export const getJobs = async (): Promise<Job[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
};

export const searchJobs = async (filters: any): Promise<Job[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  for (const key in filters) {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  }
  
  const response = await fetch(`${API_URL}/search?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to search jobs');
  }
  return response.json();
};

export const getCategories = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) return [];
  return response.json();
};

export const getShifts = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/shifts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) return [];
  return response.json();
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
  requirements: string;
  benefits: string;
  phoneContact: string;
  categories: string[];
  images: string[];
  shifts: string[];
}

export const getJobById = async (id: string | number): Promise<JobDetail> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch job details');
  }
  return response.json();
};
