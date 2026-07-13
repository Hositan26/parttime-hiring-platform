const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/v1/admin/reviews';

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

export const getReviews = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải danh sách đánh giá');
  const data = await response.json();
  return data.result;
};

export const deleteReview = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi xóa đánh giá');
  return await response.json();
};
