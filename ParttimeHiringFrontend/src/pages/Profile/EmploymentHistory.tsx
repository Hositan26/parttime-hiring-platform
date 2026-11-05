import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase } from '../../services/apiClient';
import { ReviewEditor } from './ReviewEditor';
import { Building2, Briefcase, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Employment {
  id: number; 
  storeName: string; 
  jobTitle: string | null;
  startDate: string | null; 
  endDate: string | null; 
  workStatus: string;
}

export const EmploymentHistory = () => {
  const [page, setPage] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<Employment>(`${apiBase}/users/employments?page=${page}&size=12`);
  const records = data?.content || [];
  const pages = data?.totalPages || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WORKING':
        return <span className="badge-success"><CheckCircle2 size={12} /> Đang làm việc</span>;
      case 'QUIT':
        return <span className="badge-warning"><Clock size={12} /> Đã nghỉ việc</span>;
      case 'TERMINATED':
        return <span className="badge-danger"><XCircle size={12} /> Đã chấm dứt</span>;
      default:
        return <span className="badge-neutral">{status}</span>;
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
            Lịch sử làm việc
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            Ghi nhận quá trình làm việc thực tế của bạn tại các cửa hàng sau khi đơn ứng tuyển được duyệt.
          </p>
        </div>

        {loadError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{loadError}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
            <p>Đang tải lịch sử làm việc...</p>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Briefcase size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '6px' }}>Chưa có hồ sơ làm việc</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
              Khi đơn ứng tuyển của bạn được nhà tuyển dụng duyệt, hồ sơ nhân sự và lịch sử làm việc sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {records.map(record => (
              <div 
                key={record.id} 
                className="card" 
                style={{ padding: '1.5rem 1.75rem', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Building2 size={18} color="var(--primary)" />
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                        {record.storeName}
                      </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', fontSize: '0.875rem' }}>
                      <Briefcase size={14} style={{ color: 'var(--text-light)' }} />
                      <span>{record.jobTitle || 'Vị trí làm việc theo thỏa thuận'}</span>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(record.workStatus)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <Calendar size={14} style={{ color: 'var(--text-light)' }} />
                  <span>
                    Thời gian: <strong>{record.startDate || 'Chưa xác định'}</strong> — <strong>{record.endDate || 'Hiện tại'}</strong>
                  </span>
                </div>

                {/* Review section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <ReviewEditor employmentId={record.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav 
            aria-label="Phân trang lịch sử làm việc"
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
