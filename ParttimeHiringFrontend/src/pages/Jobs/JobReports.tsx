import { useEffect, useState } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/authContext';
import { hasAnyRole } from '../../services/authPolicy';
import { apiBase, apiFetch } from '../../services/apiClient';

interface Report { id: number; body: string; jobTitle: string; status: string; authorName: string; createdAt: string; }
export const JobReports = () => {
  const { user } = useAuth();
  const admin = hasAnyRole(user?.roles || [], ['ADMIN']);
  const [items, setItems] = useState<Report[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const url = `${apiBase}/${admin ? 'admin/job-reports' : 'recruitment/reports'}`;
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    apiFetch(`${url}?page=${page}`).then(async response => {
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Không thể tải báo cáo.');
      if (active) { setItems(data.result.content); setPages(data.result.totalPages); }
    }).catch(failure => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url, page, revision]);
  const resolve = async (id: number) => {
    try {
      const response = await apiFetch(`${url}/${id}/resolve`, { method: 'PUT' });
      if (!response.ok) throw new Error('Không thể cập nhật báo cáo.'); setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể cập nhật báo cáo.'); }
  };
  return <MainLayout><h1>{admin ? 'Báo cáo tin tuyển dụng' : 'Báo cáo của tôi'}</h1>
    {error ? <p role="alert">{error}</p> : loading ? <p>Đang tải...</p> : items.length === 0 ? <p>Chưa có báo cáo.</p>
      : items.map(item => <article className="card" key={item.id} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2>{item.jobTitle}</h2><p>{item.body}</p><p>{admin && item.authorName} · {item.status === 'RESOLVED' ? 'Đã xử lý' : 'Đang chờ xử lý'}</p>
        {admin && item.status === 'OPEN' && <button className="btn-outline" onClick={() => resolve(item.id)}>Đánh dấu đã xử lý</button>}
      </article>)}
    {pages > 1 && <nav aria-label="Phân trang báo cáo">
      <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Trang trước</button>
      <span> Trang {page + 1} / {pages} </span>
      <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>Trang sau</button>
    </nav>}
  </MainLayout>;
};
