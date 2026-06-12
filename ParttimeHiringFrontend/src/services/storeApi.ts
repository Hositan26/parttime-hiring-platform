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
