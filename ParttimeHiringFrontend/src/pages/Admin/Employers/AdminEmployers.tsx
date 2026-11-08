import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { Briefcase, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle, ShieldAlert, Power } from 'lucide-react';
import { updateEmployerStatus, type AdminEmployerResponse } from '../../../services/adminEmployer.service';
import { banUser, unbanUser } from '../../../services/adminUser.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminEmployers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminEmployerResponse>(
    `${apiBase}/admin/employers?page=${page}&size=10&query=${encodeURIComponent(query)}`,
    revision
  );
  const employers = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleToggleStatus = async (employerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionLabel = newStatus === 'SUSPENDED'
      ? 'ĐÌNH CHỈ doanh nghiệp này? Các tin tuyển dụng công khai sẽ tạm ẩn và tài khoản bị chặn đăng tin mới.'
      : 'KÍCH HOẠT LẠI doanh nghiệp này?';

    if (!window.confirm(actionLabel)) return;

    try {
      await updateEmployerStatus(employerId, newStatus);
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Thao tác thất bại');
    }
  };

  const handleToggleUserBan = async (employer: AdminEmployerResponse) => {
    const action = employer.isActive ? 'khóa tài khoản đăng nhập' : 'mở khóa tài khoản đăng nhập';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} của doanh nghiệp này?`)) return;

    try {
      if (employer.isActive) {
        await banUser(employer.userId);
      } else {
        await unbanUser(employer.userId);
      }
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return (
          <span className={`${styles.badge} ${styles.badgeWarning}`}>
            <Clock size={13} /> Chờ duyệt HS
          </span>
        );
      case 'ACTIVE':
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <CheckCircle2 size={13} /> Hoạt động
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <XCircle size={13} /> Đình chỉ
          </span>
        );
      case 'INACTIVE':
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            Ngừng HĐ
          </span>
        );
      default:
        return <span className={`${styles.badge} ${styles.badgeNeutral}`}>{status}</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Doanh nghiệp & Nhà Tuyển dụng</h1>
        <p className={styles.subtitle}>Kiểm soát độc lập giữa tư cách pháp nhân doanh nghiệp và tài khoản đăng nhập.</p>
      </div>

      {loadError && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{loadError}</span>
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
            placeholder="Tìm tên doanh nghiệp..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Briefcase size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách nhà tuyển dụng...</p>
          </div>
        ) : employers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Briefcase size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy doanh nghiệp nào</h2>
            <p className={styles.emptyStateText}>Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Công ty / Doanh nghiệp</th>
                    <th>Người đại diện</th>
                    <th>Thông tin liên hệ</th>
                    <th>Tư cách Doanh nghiệp</th>
                    <th>Tài khoản đăng nhập</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((e) => (
                    <tr key={e.employerId}>
                      <td className={styles.idCell}>#{e.employerId}</td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarSmall} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <div className={styles.primaryText}>{e.companyName || '-'}</div>
                            <div className={styles.subText}>Tài khoản: @{e.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{e.representativeName || '-'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem', color: '#334155' }}>{e.emailContact}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{e.phoneContact || '-'}</div>
                      </td>
                      <td>{getStatusBadge(e.status)}</td>
                      <td>
                        <span className={`${styles.badge} ${e.isActive ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {e.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{e.isActive ? 'Được đăng nhập' : 'Bị khóa'}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => handleToggleStatus(e.employerId, e.status)}
                            className={`${styles.actionBtn} ${e.status === 'ACTIVE' ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                            title={e.status === 'ACTIVE' ? 'Đình chỉ tư cách doanh nghiệp' : 'Kích hoạt lại doanh nghiệp'}
                          >
                            <Power size={14} />
                            <span>{e.status === 'ACTIVE' ? 'Đình chỉ' : 'Kích hoạt'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserBan(e)}
                            className={`${styles.actionBtn} ${e.isActive ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                            title="Khóa hoặc mở khóa quyền đăng nhập tài khoản người dùng"
                          >
                            <ShieldAlert size={14} />
                            <span>{e.isActive ? 'Khóa User' : 'Mở User'}</span>
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
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? employers.length} doanh nghiệp)
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
    </div>
  );
};
