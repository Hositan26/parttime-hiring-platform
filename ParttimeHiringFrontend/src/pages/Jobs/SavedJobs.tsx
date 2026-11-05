import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Banknote, Building2, ChevronLeft, ChevronRight, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';
import type { Job } from '../../services/job.service';

export const SavedJobs = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const { data, loading, error: loadError } = usePagedResource<Job>(`${apiBase}/users/saved-jobs?page=${page}&size=12`, revision);
  const jobs = data?.content || [];
  const pages = data?.totalPages || 0;

  const remove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`${apiBase}/users/saved-jobs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Không thể bỏ lưu việc.');
      if (jobs.length === 1 && page > 0) setPage(page - 1); 
      else setRevision(value => value + 1);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể bỏ lưu việc.'); 
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            Việc làm đã lưu
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
            Xem lại các cơ hội việc làm bạn quan tâm và ứng tuyển khi đã sẵn sàng.
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
            <p>Đang tải danh sách việc đã lưu...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Heart size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Bạn chưa lưu công việc nào</h3>
            <p style={{ color: 'var(--text-gray)', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
              Khi tìm thấy công việc ưng ý, hãy nhấn vào biểu tượng trái tim để lưu lại và xem lại bất cứ lúc nào.
            </p>
            <Link to="/jobs" className="btn-primary">
              Khám phá việc làm ngay <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {jobs.map(job => {
              const isClosed = job.status !== 'ACTIVE';
              return (
                <div 
                  key={job.id} 
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    opacity: isClosed ? 0.75 : 1,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '0.75rem' }}>
                      <span className={isClosed ? 'badge-neutral' : 'badge-success'}>
                        {isClosed ? 'Đã ngừng tuyển' : 'Đang tuyển'}
                      </span>
                      <button 
                        type="button" 
                        onClick={(e) => remove(job.id, e)}
                        title="Bỏ lưu việc này"
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        aria-label="Bỏ lưu việc"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                      <Link to={`/jobs/${job.id}`} style={{ color: 'inherit' }}>
                        {job.title}
                      </Link>
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <Building2 size={14} style={{ flexShrink: 0, color: 'var(--text-light)' }} />
                      <span style={{ fontWeight: 500 }}>{job.store}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <MapPin size={14} style={{ flexShrink: 0, color: 'var(--text-light)' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Banknote size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{job.salary}</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
                      Xem chi tiết →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <nav 
            aria-label="Phân trang việc đã lưu"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}
          >
            <button 
              className="btn-outline" 
              disabled={loading || page === 0} 
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} /> Trang trước
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
              Trang <strong>{page + 1}</strong> / {pages}
            </span>
            <button 
              className="btn-outline" 
              disabled={loading || page + 1 >= pages} 
              onClick={() => setPage(page + 1)}
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </MainLayout>
  );
};
