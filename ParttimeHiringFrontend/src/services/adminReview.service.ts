import { apiFetch, apiBase } from './apiClient';
const API_URL = apiBase + '/admin/reviews';

export interface AdminReviewResponse {
  reviewId: number;
  storeName: string;
  reviewerName: string;
  reviewerUsername: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export const getReviews = async (page = 0, size = 10, query = '') => {
  const response = await apiFetch(`${API_URL}?page=${page}&size=${size}&query=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải danh sách đánh giá');
  const data = await response.json();
  return data.result;
};

export const deleteReview = async (id: number) => {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi xóa đánh giá');
  return await response.json();
};

export const updateReviewVisibility = async (id: number, visible: boolean) => {
  const response = await apiFetch(`${API_URL}/${id}/visibility?visible=${visible}`, { method: 'PUT' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Không cập nhật được đánh giá');
  return data.result;
};
