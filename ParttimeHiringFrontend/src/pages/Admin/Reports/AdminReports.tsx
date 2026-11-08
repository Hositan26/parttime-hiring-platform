import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBase, apiFetch } from '../../../services/apiClient';
import { usePagedResource } from '../../../services/usePagedResource';
import { getAdminJobDetail } from '../../../services/adminJobPost.service';
import type { AdminJobPostResponse } from '../../../services/adminJobPost.service';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  X,
  Briefcase,
  Store,
  User,
  ExternalLink
} from 'lucide-react';
import styles from '../Verifications/AdminVerifications.module.css';

interface Report {
  id: number;
  body: string;
  jobId: number;
  jobTitle: string;
  authorName: string;
  status: string;
}

export const AdminReports = () => {
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminJobPostResponse | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data, loading, error: loadError } = usePagedResource<Report>(
    `${apiBase}/admin/job-reports?page=${page}${status ? `&status=${status}` : ''}`,
    revision
  );

  const reports = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleResolve = async (reportId: number) => {
    if (!window.confirm('Đánh dấu báo cáo này đã được xem xét và xử lý thỏa đáng?')) return;

    setResolvingId(reportId);
    setError('');
    try {
      const response = await apiFetch(`${apiBase}/admin/job-reports/${reportId}/resolve`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Không xử lý được báo cáo');
      setRevision(value => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại');
    } finally {
      setResolvingId(null);
    }
  };

  const handleViewJob = async (jobId: number) => {
    setError('');
    try {
      const jobData = await getAdminJobDetail(jobId);
      setDetail(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thông tin tin tuyển dụng');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Báo cáo Tin Tuyển Dụng</h1>
        <p className={styles.subtitle}>Tiếp nhận và giải quyết phản ánh của ứng viên về các tin tuyển dụng có dấu hiệu vi phạm.</p>
      </div>

      {(error || loadError) && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{error || loadError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={styles.filtersCard}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${status === 'OPEN' ? styles.activeTab : ''}`}
            onClick={() => { setStatus('OPEN'); setPage(0); }}
          >
            Chờ xử lý
          </button>
          <button
            className={`${styles.tab} ${status === 'RESOLVED' ? styles.activeTab : ''}`}
            onClick={() => { setStatus('RESOLVED'); setPage(0); }}
          >
            Đã xử lý
          </button>
          <button
            className={`${styles.tab} ${status === '' ? styles.activeTab : ''}`}
            onClick={() => { setStatus(''); setPage(0); }}
          >
            Tất cả báo cáo
          </button>
        </div>

        <select
          className={styles.selectDropdown}
          aria-label="Trạng thái báo cáo"
          value={status}
          onChange={event => { setStatus(event.target.value); setPage(0); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="OPEN">Chờ xử lý</option>
          <option value="RESOLVED">Đã xử lý</option>
        </select>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <AlertTriangle size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách báo cáo...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <CheckCircle2 size={32} color="#00b14f" />
            </div>
            <h2 className={styles.emptyStateTitle}>Không có báo cáo nào</h2>
            <p className={styles.emptyStateText}>Hệ thống hiện không ghi nhận phản ánh nào trong mục này.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tin tuyển dụng bị báo cáo</th>
                    <th>Người báo cáo</th>
                    <th>Nội dung khiếu nại</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.idCell}>#{item.id}</td>
                      <td>
                        <div className={styles.primaryText}>{item.jobTitle}</div>
                        <div className={styles.subText}>Mã tin: #{item.jobId}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                          <User size={14} color="#94a3b8" />
                          <span>{item.authorName}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '340px' }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: '#475569',
                            lineHeight: 1.5,
                            backgroundColor: '#f8fafc',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {item.body}
                        </div>
                      </td>
                      <td>
                        {item.status === 'OPEN' ? (
                          <span className={`${styles.badge} ${styles.badgeWarning}`}>
                            <Clock size={13} /> Chờ xử lý
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <CheckCircle2 size={13} /> Đã xử lý
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            onClick={() => handleViewJob(item.jobId)}
                            title="Xem chi tiết tin tuyển dụng liên quan"
                          >
                            <Eye size={14} />
                            <span>Xem tin</span>
                          </button>

                          {item.status === 'OPEN' && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                              disabled={resolvingId === item.id}
                              onClick={() => handleResolve(item.id)}
                              title="Xác nhận đã xử lý báo cáo này"
                            >
                              <CheckCircle2 size={14} />
                              <span>{resolvingId === item.id ? 'Đang lưu...' : 'Đã xử lý'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? reports.length} báo cáo)
              </span>
              <div className={styles.paginationButtons}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(v => v - 1)}
                  className={styles.pageBtn}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page + 1 >= (data?.totalPages || 0)}
                  onClick={() => setPage(v => v + 1)}
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

      {/* Related Job Detail Modal */}
      {detail && (
        <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ width: '620px' }}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.idCell}>Tin liên quan #{detail.jobId}</span>
                <h2 className={styles.modalTitle} style={{ marginTop: '2px' }}>{detail.title}</h2>
              </div>
              <button onClick={() => setDetail(null)} className={styles.closeBtn} aria-label="Đóng chi tiết">
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={15} color="#00b14f" />
                    <strong>Doanh nghiệp:</strong> {detail.companyName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={15} color="#00b14f" />
                    <strong>Cơ sở:</strong> {detail.storeName}
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>Mô tả công việc</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {detail.description || 'Không có mô tả.'}
                </p>
              </div>

              <div className={styles.infoSection}>
                <h3>Yêu cầu ứng viên</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {detail.requirements || 'Không có yêu cầu.'}
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setDetail(null)}>
                Đóng
              </button>
              <button
                className={styles.btnConfirm}
                onClick={() => {
                  const jobTitle = detail.title;
                  setDetail(null);
                  navigate(`/admin/jobs?query=${encodeURIComponent(jobTitle)}`);
                }}
              >
                <ExternalLink size={15} />
                <span>Kiểm duyệt tin này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
