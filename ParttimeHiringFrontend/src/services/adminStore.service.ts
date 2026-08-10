const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/stores';

export interface AdminStoreResponse {
  storeId: number;
  storeName: string;
  phoneContact: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  employerId: number;
  companyName: string;
}

export const getAdminStores = async (isActive?: boolean | '', page = 0, size = 10) => {
  let url = `${API_URL}?page=${page}&size=${size}`;
  if (isActive !== '' && isActive !== undefined) {
    url += `&isActive=${isActive}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  
  const data = await response.json();
  return data.result;
};

export const updateAdminStoreStatus = async (id: number, isActive: boolean) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ isActive })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi cập nhật trạng thái');
  }
  
  const data = await response.json();
  return data.result;
};
