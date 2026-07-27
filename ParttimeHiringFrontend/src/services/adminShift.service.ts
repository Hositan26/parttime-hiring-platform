const API_URL = 'http://localhost:8088/parttime_hiring_platform/api/admin/shifts';

export interface AdminShift {
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
}

export const getShifts = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi tải danh sách ca làm việc');
  const data = await response.json();
  return data.result;
};

export const createShift = async (shift: Partial<AdminShift>) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(shift)
  });
  if (!response.ok) throw new Error('Lỗi thêm ca làm việc');
  return await response.json();
};

export const updateShift = async (id: number, shift: Partial<AdminShift>) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(shift)
  });
  if (!response.ok) throw new Error('Lỗi cập nhật ca làm việc');
  return await response.json();
};

export const deleteShift = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Lỗi xóa ca làm việc');
  return await response.json();
};
