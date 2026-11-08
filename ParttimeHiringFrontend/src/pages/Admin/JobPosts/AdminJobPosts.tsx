import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import { useSearchParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Briefcase, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, PowerOff, ShieldAlert, AlertCircle, Eye, Trash2, X, Store, DollarSign } from 'lucide-react';
import { getAdminJobDetail, deleteAdminJob, updateAdminJobPostStatus, type AdminJobPostResponse, JobStatus, type JobStatusType } from '../../../services/adminJobPost.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminJobPosts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminJobPostResponse | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<JobStatusType | ''>('');

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminJobPostResponse>(
    `${apiBase}/admin/jobs?page=${page}&size=10&query=${encodeURIComponent(query)}${statusFilter ? `&status=${statusFilter}` : ''}`,
    revision
  );
  const jobPosts = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleToggleStatus = async (jobId: number, currentStatus: JobStatusType) => {
    const newStatus = currentStatus === JobStatus.ACTIVE ? JobStatus.PAUSED : JobStatus.ACTIVE;
    const confirmMsg = currentStatus === JobStatus.ACTIVE
      ? 'Bạn có chắc muốn GỠ (Khóa) bài đăng này? Sau khi gỡ, tin sẽ bị khóa kiểm duyệt (moderationBlocked) và nhà tuyển dụng không thể tự ý kích hoạt lại.'
      : 'Bạn muốn MỞ LẠI bài đăng này? Hệ thống sẽ kiểm tra các điều kiện (cửa hàng đã duyệt, doanh nghiệp hoạt động, chưa hết hạn).';

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateAdminJobPostStatus(jobId, newStatus);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Xóa vĩnh viễn tin tuyển dụng này? Thao tác chỉ cho phép khi tin chưa có đơn ứng tuyển, tin nhắn, báo cáo hoặc lượt lưu.')) return;

    try {
      await deleteAdminJob(jobId);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không xóa được tin tuyển dụng');
    }
  };

  const handleOpenDetail = async (jobId: number) => {
    setError('');
    try {
      const jobData = await getAdminJobDetail(jobId);
      setDetail(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được chi tiết tin tuyển dụng');
    }
  };

  const getStatusBadge = (status: JobStatusType, blocked?: boolean) => {
    if (blocked) {
      return (
        <span className={`${styles.badge} ${styles.badgeDanger}`}>
          <ShieldAlert size={13} /> Admin đã gỡ
        </span>
      );
    }
    switch (status) {
      case JobStatus.ACTIVE:
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <CheckCircle2 size={13} /> Đang hiển thị
          </span>
        );
      case JobStatus.PAUSED:
        return (
          <span className={`${styles.badge} ${styles.badgeWarning}`}>
            <PowerOff size={13} /> Tạm dừng
          </span>
        );
      case JobStatus.CLOSED:
      case JobStatus.EXPIRED:
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            <XCircle size={13} /> {status === JobStatus.EXPIRED ? 'Đã hết hạn' : 'Đã đóng'}
          </span>
        );
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
        <h1 className={styles.title}>Kiểm duyệt Tin Tuyển Dụng</h1>
        <p className={styles.subtitle}>Giám sát nội dung công việc, áp dụng cờ kiểm duyệt và bảo vệ quyền lợi ứng viên.</p>
      </div>

      {(error || loadError) && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{error || loadError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={event => { setQuery(event.target.value); setPage(0); }}
            placeholder="Tìm theo tiêu đề công việc..."
            className={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${statusFilter === '' ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(''); setPage(0); }}
            >
              Tất cả
            </button>
            <button
              className={`${styles.tab} ${statusFilter === JobStatus.ACTIVE ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(JobStatus.ACTIVE); setPage(0); }}
            >
              Đang hiển thị
            </button>
            <button
              className={`${styles.tab} ${statusFilter === JobStatus.PAUSED ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(JobStatus.PAUSED); setPage(0); }}
            >
              Tạm dừng / Bị gỡ
            </button>
          </div>

          <select
            aria-label="Trạng thái tin"
            className={styles.selectDropdown}
            value={statusFilter}
            onChange={event => { setStatusFilter(event.target.value as JobStatusType | ''); setPage(0); }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.values(JobStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Briefcase size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách bài đăng...</p>
          </div>
        ) : jobPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Briefcase size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy tin tuyển dụng nào</h2>
            <p className={styles.emptyStateText}>Hãy thử tìm kiếm với tiêu đề khác hoặc đổi bộ lọc trạng thái.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề công việc</th>
                    <th>Công ty & Cửa hàng</th>
                    <th>Mức lương / Giờ</th>
                    <th>Trạng thái kiểm duyệt</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPosts.map((job) => (
                    <tr key={job.jobId}>
                      <td className={styles.idCell}>#{job.jobId}</td>
                      <td>
                        <div className={styles.primaryText}>{job.title}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: '#334155' }}>{job.companyName}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.85rem' }}>
                          {formatCurrency(job.hourlyWageMin)} - {formatCurrency(job.hourlyWageMax)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {getStatusBadge(job.status, job.moderationBlocked)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            onClick={() => handleOpenDetail(job.jobId)}
                            title="Xem chi tiết đầy đủ tin tuyển dụng"
                          >
                            <Eye size={14} />
                            <span>Xem</span>
                          </button>

                          <button
                            className={`${styles.actionBtn} ${job.status === JobStatus.ACTIVE ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                            onClick={() => handleToggleStatus(job.jobId, job.status)}
                            title={job.status === JobStatus.ACTIVE ? 'Gỡ tin khỏi hiển thị công khai' : 'Mở lại tin'}
                          >
                            {job.status === JobStatus.ACTIVE ? <PowerOff size={14} /> : <CheckCircle2 size={14} />}
                            <span>{job.status === JobStatus.ACTIVE ? 'Gỡ bài' : 'Mở lại'}</span>
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDeleteJob(job.jobId)}
                            title="Xóa tin nếu chưa có lịch sử ứng tuyển/báo cáo"
                          >
                            <Trash2 size={14} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? jobPosts.length} tin)
              </span>
              <div className={styles.paginationButtons}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className={styles.pageBtn}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className={styles.pageBtn}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Premium Job Detail Drawer / Modal */}
      {detail && (
        <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ width: '640px' }}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.idCell}>ID #{detail.jobId}</span>
                <h2 className={styles.modalTitle} style={{ marginTop: '2px' }}>{detail.title}</h2>
              </div>
              <button onClick={() => setDetail(null)} className={styles.closeBtn} aria-label="Đóng chi tiết">
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {getStatusBadge(detail.status, detail.moderationBlocked)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={15} color="#00b14f" />
                    <strong>Doanh nghiệp:</strong> {detail.companyName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={15} color="#00b14f" />
                    <strong>Cơ sở:</strong> {detail.storeName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={15} color="#00b14f" />
                    <strong>Mức lương:</strong> {formatCurrency(detail.hourlyWageMin)} - {formatCurrency(detail.hourlyWageMax)} / Giờ
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>Mô tả công việc</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {detail.description || 'Chưa có mô tả.'}
                </p>
              </div>

              <div className={styles.infoSection}>
                <h3>Yêu cầu ứng viên</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {detail.requirements || 'Không yêu cầu cụ thể.'}
                </p>
              </div>

              {detail.benefits && (
                <div className={styles.infoSection}>
                  <h3>Quyền lợi & Đãi ngộ</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                    {detail.benefits}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setDetail(null)}>
                Đóng
              </button>
              <button
                className={detail.status === JobStatus.ACTIVE ? styles.btnRejectConfirm : styles.btnConfirm}
                onClick={async () => {
                  const targetJobId = detail.jobId;
                  const targetStatus = detail.status;
                  setDetail(null);
                  await handleToggleStatus(targetJobId, targetStatus);
                }}
              >
                {detail.status === JobStatus.ACTIVE ? 'Gỡ tin này' : 'Mở lại tin này'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
