import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/authContext';
import { hasAnyRole } from '../../services/authPolicy';
import { apiBase, apiFetch } from '../../services/apiClient';
import { Flag, CheckCircle2, Clock, ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface Report { 
  id: number; 
  body: string; 
  jobTitle: string; 
  status: string; 
  authorName: string; 
  createdAt: string; 
}

export const JobReports = () => {
  const { user } = useAuth();
  const admin = hasAnyRole(user?.roles || [], ['ADMIN']);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');

  const url = `${apiBase}/${admin ? 'admin/job-reports' : 'recruitment/reports'}`;
  const { data, loading, error: loadError } = usePagedResource<Report>(`${url}?page=${page}`, revision);
  const items = data?.content || [];
  const pages = data?.totalPages || 0;

  const resolve = async (id: number) => {
    try {
      const response = await apiFetch(`${url}/${id}/resolve`, { method: 'PUT' });
      if (!response.ok) throw new Error('Không thể cập nhật báo cáo.'); 
      setRevision(value => value + 1);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể cập nhật báo cáo.'); 
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/jobs" style={{ color: 'var(--text-gray)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Quay lại danh sách việc làm
          </Link>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
            {admin ? 'Quản lý báo cáo tin tuyển dụng' : 'Báo cáo của tôi'}
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            {admin 
              ? 'Theo dõi và xử lý các phản ánh vi phạm tin tuyển dụng từ người dùng.'
              : 'Theo dõi tiến độ xử lý của ban quản trị đối với các tin tuyển dụng bạn đã báo cáo.'}
          </p>
        </div>

        {(error || loadError) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error || loadError}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
            <p>Đang tải báo cáo...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Flag size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '6px' }}>Chưa có báo cáo nào</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: 0 }}>
              Bạn chưa gửi phản ánh hoặc báo cáo vi phạm nào cho các tin tuyển dụng.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map(item => (
              <div 
                key={item.id} 
                className="card" 
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                      {item.jobTitle}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.8125rem', color: 'var(--text-light)' }}>
                      {admin && item.authorName && (
                        <span>Người báo cáo: <strong>{item.authorName}</strong></span>
                      )}
                      <span>Gửi lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <div>
                    {item.status === 'RESOLVED' ? (
                      <span className="badge-success"><CheckCircle2 size={12} /> Đã xử lý</span>
                    ) : (
                      <span className="badge-warning"><Clock size={12} /> Đang chờ xử lý</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>
                  <strong>Nội dung phản ánh:</strong> {item.body}
                </div>

                {admin && item.status === 'OPEN' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button className="btn-primary" onClick={() => resolve(item.id)}>
                      <CheckCircle2 size={15} /> Đánh dấu đã xử lý
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav 
            aria-label="Phân trang báo cáo"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}
          >
            <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} /> Trang trước
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
              Trang <strong>{page + 1}</strong> / {pages}
            </span>
            <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>
              Trang sau <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </MainLayout>
  );
};
