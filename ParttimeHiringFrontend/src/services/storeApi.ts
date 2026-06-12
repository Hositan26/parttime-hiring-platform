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
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores?sortBy=${sortBy}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  
  return response.json();
};



export const deleteStore = async (storeId: string | number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores/${storeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || 'Failed to delete store');
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
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores/${storeId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch store detail');
  }
  
  return response.json();
};

export interface UpdateStoreRequestDTO {
  name: string;
  phone: string;
  address: string;
  description: string;
}

export const updateStore = async (storeId: string | number, data: UpdateStoreRequestDTO): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores/${storeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || 'Failed to update store');
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

export const createStore = async (data: CreateStoreRequestDTO): Promise<EmployerStoreDTO> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || 'Failed to create store');
  }
  
  return response.json();
};

export const toggleStoreStatus = async (storeId: string | number): Promise<EmployerStoreDTO> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  
  const response = await fetch(`http://localhost:8088/parttime_hiring_platform/api/v1/employer/stores/${storeId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || 'Failed to toggle status');
  }
  
  return response.json();
};
