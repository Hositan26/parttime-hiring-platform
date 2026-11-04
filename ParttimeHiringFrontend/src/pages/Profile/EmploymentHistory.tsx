import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase } from '../../services/apiClient';
import { ReviewEditor } from './ReviewEditor';

interface Employment {
  id: number; storeName: string; jobTitle: string | null;
  startDate: string | null; endDate: string | null; workStatus: string;
}

export const EmploymentHistory = () => {
  const [page, setPage] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<Employment>(`${apiBase}/users/employments?page=${page}&size=12`);
  const records = data?.content || [];
  const pages = data?.totalPages || 0;
  return <MainLayout><h1>Lịch sử làm việc</h1>
    {loadError ? <p role="alert">{loadError}</p> : loading ? <p>Đang tải...</p>
      : records.length === 0 ? <p>Chưa có lịch sử làm việc.</p>
      : records.map(record => <article key={record.id} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2>{record.storeName}</h2><p>{record.jobTitle || 'Công việc đã được lưu trữ'}</p>
        <p>{record.startDate || 'Chưa xác định'} — {record.endDate || 'Hiện tại'}</p>
        <span className={record.workStatus === 'WORKING' ? 'badge-success' : 'badge-warning'}>
          {record.workStatus === 'WORKING' ? 'Đang làm việc' : record.workStatus === 'QUIT' ? 'Đã nghỉ việc' : 'Đã chấm dứt'}
        </span>
        <ReviewEditor employmentId={record.id} />
      </article>)}
    {pages > 1 && <nav aria-label="Phân trang lịch sử làm việc">
      <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Trang trước</button>
      <span> Trang {page + 1} / {pages} </span>
      <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>Trang sau</button>
    </nav>}
  </MainLayout>;
};
