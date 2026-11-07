import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBase, apiFetch } from '../../../services/apiClient';
import { usePagedResource } from '../../../services/usePagedResource';
import { getAdminJobDetail } from '../../../services/adminJobPost.service';
import type { AdminJobPostResponse } from '../../../services/adminJobPost.service';

interface Report { id: number; body: string; jobId: number; jobTitle: string; authorName: string; status: string }
export const AdminReports = () => {
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminJobPostResponse | null>(null);
  const navigate = useNavigate();
  const { data, loading, error: loadError } = usePagedResource<Report>(`${apiBase}/admin/job-reports?page=${page}${status ? `&status=${status}` : ''}`, revision);
  return <section><h1>Báo cáo tin tuyển dụng</h1>
    <select className="input-base" aria-label="Trạng thái báo cáo" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}>
      <option value="">Tất cả</option><option value="OPEN">Chờ xử lý</option><option value="RESOLVED">Đã xử lý</option>
    </select>
    {(error || loadError) && <p role="alert">{error || loadError}</p>}
    {loading ? <p role="status">Đang tải...</p> : !data?.content.length ? <p>Không có báo cáo phù hợp.</p> : data.content.map(item => <article className="card" key={item.id}>
      <h2>{item.jobTitle}</h2><p>{item.authorName} · {item.status}</p><p>{item.body}</p>
      <button className="btn-outline" onClick={async () => { try { setDetail(await getAdminJobDetail(item.jobId)); } catch (error) { setError(error instanceof Error ? error.message : 'Không tải được tin'); } }}>Xem tin liên quan</button>
      {item.status === 'OPEN' && <button className="btn-primary" onClick={async () => {
        if (!window.confirm('Đánh dấu báo cáo đã được xem xét và xử lý?')) return;
        try { const response = await apiFetch(`${apiBase}/admin/job-reports/${item.id}/resolve`, { method: 'PUT' });
          if (!response.ok) throw new Error('Không xử lý được báo cáo'); setRevision(value => value + 1);
        } catch (error) { setError(error instanceof Error ? error.message : 'Thao tác thất bại'); }
      }}>Đã xử lý</button>}
    </article>)}
    {detail && <article className="card"><button className="btn-outline" onClick={() => setDetail(null)}>Đóng</button><h2>{detail.title}</h2><p>{detail.description}</p><p>{detail.requirements}</p><button className="btn-primary" onClick={() => navigate(`/admin/jobs?query=${encodeURIComponent(detail.title)}`)}>Kiểm duyệt tin</button></article>}
    <button className="btn-outline" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trước</button>
    <span> Trang {page + 1} / {Math.max(1, data?.totalPages || 0)} </span>
    <button className="btn-outline" disabled={page + 1 >= (data?.totalPages || 0)} onClick={() => setPage(value => value + 1)}>Sau</button>
  </section>;
};
