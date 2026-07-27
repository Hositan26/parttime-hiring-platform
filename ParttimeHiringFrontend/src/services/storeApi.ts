export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp: string;
}

export interface EmployerStoreDTO {
  storeId: string | number;
  name: string;
  phone: string;
  address: string;
  jobs: number;
  applications: number;
  status: string;
  logo: string;
}

export interface EmployerStoreListDTO {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  stores: EmployerStoreDTO[];
}

export const getEmployerStores = async (sortBy: string = 'newest'): Promise<EmployerStoreListDTO> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores?sortBy=${sortBy}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to fetch stores');
  }
  
  const data: ApiResponse<EmployerStoreListDTO> = await response.json();
  return data.result;
};

export const deleteStore = async (storeId: string | number): Promise<void> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores/${storeId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete store');
  }
};

export interface StoreJobDTO {
  jobId: number;
  title: string;
  status: string;
  applications: number;
  expiredAt: string;
  createdAt: string;
}

export interface EmployerStoreDetailDTO {
  storeId: number;
  name: string;
  phone: string;
  address: string;
  description: string;
  status: string;
  logo: string;
  jobs: StoreJobDTO[];
}

export const getStoreDetail = async (storeId: string | number): Promise<EmployerStoreDetailDTO> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores/${storeId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to fetch store detail');
  }
  
  const data: ApiResponse<EmployerStoreDetailDTO> = await response.json();
  return data.result;
};

export interface EmployeeResponseDTO {
  employmentId: number;
  userId: number;
  displayName: string;
  email: string;
  avatarUrl: string;
  jobTitle: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const getStoreEmployees = async (storeId: string | number): Promise<EmployeeResponseDTO[]> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores/${storeId}/employees`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to fetch store employees');
  }
  
  const data: ApiResponse<EmployeeResponseDTO[]> = await response.json();
  return data.result;
};

export interface UpdateStoreRequestDTO {
  name: string;
  phone: string;
  address: string;
  description: string;
}

export const updateStore = async (storeId: string | number, requestData: UpdateStoreRequestDTO): Promise<void> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores/${storeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update store');
  }
};

export interface CreateStoreRequestDTO {
  name: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  streetAddress: string;
  description: string;
}

export const createStore = async (requestData: CreateStoreRequestDTO): Promise<EmployerStoreDTO> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create store');
  }
  
  const data: ApiResponse<EmployerStoreDTO> = await response.json();
  return data.result;
};

export const toggleStoreStatus = async (storeId: string | number): Promise<EmployerStoreDTO> => {
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/employer/stores/${storeId}/status`, {
    method: 'PATCH',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to toggle status');
  }
  
  const data: ApiResponse<EmployerStoreDTO> = await response.json();
  return data.result;
};
