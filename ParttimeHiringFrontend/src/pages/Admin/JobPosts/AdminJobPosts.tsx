import React, { useState, useEffect } from 'react';
import { Briefcase, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, PowerOff, ShieldAlert } from 'lucide-react';
import { getAdminJobPosts, getAdminJobDetail, deleteAdminJob, updateAdminJobPostStatus, type AdminJobPostResponse, JobStatus, type JobStatusType } from '../../../services/adminJobPost.service';
import styles from '../Verifications/AdminVerifications.module.css'; // Reusing styles

export const AdminJobPosts: React.FC = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminJobPostResponse | null>(null);
  const [jobPosts, setJobPosts] = useState<AdminJobPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatusType | ''>('');

  const fetchList = async (pageNum: number, status: JobStatusType | '') => {
    try {
      setLoading(true);
      const data = await getAdminJobPosts(status, pageNum, 10, query);
      setJobPosts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không tải được tin');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, statusFilter);
  }, [page, statusFilter, query]);

  const handleToggleStatus = async (jobId: number, currentStatus: JobStatusType) => {
    let newStatus = currentStatus === JobStatus.ACTIVE ? JobStatus.PAUSED : JobStatus.ACTIVE;
    let confirmMsg = currentStatus === JobStatus.ACTIVE 
        ? 'Bạn có chắc muốn KHÓA (Gỡ) bài đăng này? Nó sẽ không còn hiển thị với ứng viên.' 
        : 'Bạn muốn MỞ KHÓA bài đăng này?';
        
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await updateAdminJobPostStatus(jobId, newStatus);
      alert('Đã cập nhật trạng thái bài đăng');
      fetchList(page, statusFilter);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: JobStatusType) => {
    switch (status) {
      case JobStatus.ACTIVE:
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={14}/> Đang hiển thị</span>;
      case JobStatus.PAUSED:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><ShieldAlert size={14}/> Bị Gỡ</span>;
      case JobStatus.CLOSED:
      case JobStatus.EXPIRED:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><XCircle size={14}/> Hết hạn/Đóng</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Tin Tuyển Dụng</h1>
        <p className={styles.subtitle}>Kiểm duyệt và quản lý tất cả bài đăng trên hệ thống.</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input type="text" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Tìm tên công việc..." className={styles.searchInput} />
          </div>
          
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${statusFilter === '' ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(''); setPage(0); }}>
              Tất cả
            </button>
            <button className={`${styles.tab} ${statusFilter === JobStatus.ACTIVE ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(JobStatus.ACTIVE); setPage(0); }}>
              Đang hiển thị
            </button>
            <button className={`${styles.tab} ${statusFilter === JobStatus.PAUSED ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(JobStatus.PAUSED); setPage(0); }}>
              Bị Gỡ
            </button>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}
        <select aria-label="Trạng thái tin" className="input-base" value={statusFilter} onChange={event => { setStatusFilter(event.target.value as JobStatusType | ''); setPage(0); }}>
          <option value="">Tất cả trạng thái</option>{Object.values(JobStatus).map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        {detail && <section className={styles.filtersCard} aria-label="Chi tiết tin">
          <button className="btn-outline" onClick={() => setDetail(null)}>Đóng chi tiết</button>
          <h2>{detail.title}</h2><p>{detail.companyName} · {detail.storeName}</p>
          <p>{detail.description}</p><p>{detail.requirements}</p><p>{detail.benefits}</p>
        </section>}
        {loading ? (
          <div className={styles.emptyState}>Đang tải dữ liệu...</div>
        ) : jobPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase size={48} className={styles.emptyIcon} />
            <p>Không có bài đăng nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề công việc</th>
                  <th>Công ty</th>
                  <th>Mức lương / Giờ</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobPosts.map((job) => (
                  <tr key={job.jobId}>
                    <td>#{job.jobId}</td>
                    <td style={{ fontWeight: 600 }}>{job.title}</td>
                    <td>{job.companyName}</td>
                    <td>{formatCurrency(job.hourlyWageMin)} - {formatCurrency(job.hourlyWageMax)}</td>
                    <td>{getStatusBadge(job.status)}{job.moderationBlocked && <span className="badge-danger">Admin đã gỡ</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-outline" onClick={async () => {
                        try { setDetail(await getAdminJobDetail(job.jobId)); }
                        catch (error) { setError(error instanceof Error ? error.message : 'Không tải được chi tiết'); }
                      }}>Xem</button>
                      <button className="btn-outline" onClick={async () => {
                        if (!window.confirm('Xóa tin không có đơn hoặc lịch sử liên quan?')) return;
                        try { await deleteAdminJob(job.jobId); fetchList(page, statusFilter); }
                        catch (error) { setError(error instanceof Error ? error.message : 'Không xóa được tin'); }
                      }}>Xóa</button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleToggleStatus(job.jobId, job.status)}
                        style={{ color: job.status === JobStatus.ACTIVE ? '#ef4444' : '#10b981' }}
                      >
                        {job.status === JobStatus.ACTIVE ? <PowerOff size={16} /> : <CheckCircle2 size={16} />}
                        {job.status === JobStatus.ACTIVE ? 'Gỡ Bài' : 'Mở Lại'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className={styles.pagination}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
