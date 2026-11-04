import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';

interface Notification { id: number; message: string; createdAt: string; readAt: string | null; }
export const Notifications = () => {
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const { data, loading, error: loadError } = usePagedResource<Notification>(`${apiBase}/users/notifications?page=${page}&size=20`, revision);
  const items = data?.content || [];
  const pages = data?.totalPages || 0;
  const read = async (id: number) => {
    try {
      const response = await apiFetch(`${apiBase}/users/notifications/${id}/read`, { method: 'PUT' });
      if (!response.ok) throw new Error('Không thể đánh dấu đã đọc.');
      setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể cập nhật thông báo.'); }
  };
  return <MainLayout><h1>Thông báo</h1><button className="btn-outline" onClick={() => setRevision(value => value + 1)}>Làm mới</button>
    {(error || loadError) ? <p role="alert">{error || loadError}</p> : loading ? <p>Đang tải...</p> : items.length === 0 ? <p>Chưa có thông báo.</p>
      : items.map(item => <article key={item.id} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <p>{item.message}</p><time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
        <p><Link to="/applied-jobs">Xem đơn ứng tuyển</Link></p>
        {!item.readAt ? <button className="btn-outline" onClick={() => read(item.id)}>Đánh dấu đã đọc</button> : <span>Đã đọc</span>}
      </article>)}
    {pages > 1 && <nav aria-label="Phân trang thông báo">
      <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Trang trước</button>
      <span> Trang {page + 1} / {pages} </span>
      <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>Trang sau</button>
    </nav>}
  </MainLayout>;
};
