import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';
import { Bell, CheckCircle2, Clock, ArrowRight, RefreshCcw, AlertCircle } from 'lucide-react';

interface Notification { 
  id: number; 
  applicationId: number | null; 
  message: string; 
  createdAt: string; 
  readAt: string | null; 
}

export const Notifications = ({ employer = false }: { employer?: boolean }) => {
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const { data, loading, error: loadError } = usePagedResource<Notification>(`${apiBase}/users/notifications?page=${page}&size=20`, revision);
  const items = data?.content || [];
  const pages = data?.totalPages || 0;

  const read = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`${apiBase}/users/notifications/${id}/read`, { method: 'PUT' });
      if (!response.ok) throw new Error('Không thể đánh dấu đã đọc.');
      setRevision(value => value + 1);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể cập nhật thông báo.'); 
    }
  };

  const getTargetUrl = (item: Notification) => {
    if (employer) {
      return item.applicationId 
        ? `/applications/${item.applicationId}/conversation` 
        : '/employer/applications';
    }
    return item.applicationId 
      ? `/applications/${item.applicationId}/conversation`
      : '/applied-jobs';
  };

  const content = (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
            Thông báo
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            {employer 
              ? 'Cập nhật về đơn ứng tuyển mới, rút đơn, tin nhắn và lịch hẹn phỏng vấn.'
              : 'Cập nhật về kết quả ứng tuyển, phản hồi từ doanh nghiệp và thông tin tài khoản.'}
          </p>
        </div>
        <button 
          type="button" 
          className="btn-outline" 
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          onClick={() => setRevision(v => v + 1)}
        >
          <RefreshCcw size={14} /> Làm mới
        </button>
      </div>

      {(error || loadError) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.9rem' }} role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error || loadError}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
          <p>Đang tải thông báo...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '6px' }}>Chưa có thông báo nào</h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: 0 }}>
            Khi có diễn biến mới về đơn ứng tuyển hoặc tin nhắn, hệ thống sẽ gửi thông báo tại đây.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map(item => {
            const isUnread = !item.readAt;
            const target = getTargetUrl(item);

            return (
              <div 
                key={item.id} 
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  backgroundColor: isUnread ? '#F0FDF4' : 'var(--bg-white)',
                  borderLeft: isUnread ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                  transition: 'background-color 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isUnread ? 'var(--primary-light)' : 'var(--bg-lighter)', color: isUnread ? 'var(--primary)' : 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Bell size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.925rem', fontWeight: isUnread ? 600 : 400, color: 'var(--text-dark)', lineHeight: '1.5' }}>
                      {item.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {isUnread ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Chưa đọc</span>
                      ) : (
                        <span>Đã đọc</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <Link 
                    to={target} 
                    className="btn-outline" 
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight size={13} />
                  </Link>

                  {isUnread && (
                    <button 
                      type="button" 
                      onClick={(e) => read(item.id, e)}
                      title="Đánh dấu đã đọc"
                      style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'var(--text-gray)' }}
                      aria-label="Đánh dấu đã đọc"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <nav 
          aria-label="Phân trang thông báo"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}
        >
          <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
            Trang <strong>{page + 1}</strong> / {pages}
          </span>
          <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>
            Trang sau
          </button>
        </nav>
      )}
    </div>
  );

  return employer ? <div style={{ padding: '8px 4px' }}>{content}</div> : <MainLayout>{content}</MainLayout>;
};
