const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/v1/admin/categories';

export interface AdminCategory {
  categoryId: number;
  categoryName: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export const getCategories = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải danh sách ngành nghề');
  const data = await response.json();
  return data.result;
};

export const createCategory = async (category: Partial<AdminCategory>) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(category)
  });
  if (!response.ok) throw new Error('Lỗi thêm ngành nghề');
  return await response.json();
};

export const updateCategory = async (id: number, category: Partial<AdminCategory>) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(category)
  });
  if (!response.ok) throw new Error('Lỗi cập nhật ngành nghề');
  return await response.json();
};

export const deleteCategory = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi xóa ngành nghề');
  return await response.json();
};
