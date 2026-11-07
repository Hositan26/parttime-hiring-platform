import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import { useAuth } from '../../../context/authContext';
import React, { useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Mail, Calendar, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { banUser, unbanUser, type AdminUserResponse } from '../../../services/adminUser.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [page, setPage] = useState(0);

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminUserResponse>(
    `${apiBase}/admin/users?page=${page}&size=10&query=${encodeURIComponent(query)}${active ? `&active=${active}` : ''}`,
    revision
  );
  const users = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleToggleBan = async (u: AdminUserResponse) => {
    const action = u.isActive ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${u.username}?`)) return;

    try {
      if (u.isActive) {
        await banUser(u.id);
      } else {
        await unbanUser(u.id);
      }
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Tài khoản Người dùng</h1>
        <p className={styles.subtitle}>Xem danh sách, tìm kiếm và quản lý quyền truy cập của các tài khoản ứng viên.</p>
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
            placeholder="Tìm theo username, tên, email..."
            className={styles.searchInput}
          />
        </div>

        <select
          aria-label="Trạng thái tài khoản"
          className={styles.selectDropdown}
          value={active}
          onChange={event => { setActive(event.target.value); setPage(0); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã bị khóa</option>
        </select>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Users size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách người dùng...</p>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Users size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy tài khoản nào</h2>
            <p className={styles.emptyStateText}>Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Ngày sinh</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.username === currentUser?.username;
                    return (
                      <tr key={u.id}>
                        <td className={styles.idCell}>#{u.id}</td>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatarSmall}>
                              {(u.displayName || u.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={styles.primaryText}>{u.displayName}</div>
                              <div className={styles.subText}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                            <Mail size={14} color="#94a3b8" />
                            <span>{u.email || '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                            <Calendar size={14} color="#94a3b8" />
                            <span>{u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {u.roles.map(r => {
                              const roleName = r.replace('ROLE_', '');
                              const isRoleAdmin = roleName === 'ADMIN';
                              return (
                                <span
                                  key={r}
                                  className={`${styles.badge} ${isRoleAdmin ? styles.badgeSuccess : styles.badgeNeutral}`}
                                >
                                  {roleName}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          {u.isActive ? (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                              <CheckCircle2 size={13} /> Hoạt động
                            </span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeDanger}`}>
                              <XCircle size={13} /> Bị khóa
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            disabled={isSelf}
                            title={isSelf ? 'Không thể tự khóa tài khoản đang đăng nhập' : undefined}
                            onClick={() => handleToggleBan(u)}
                            className={`${styles.actionBtn} ${u.isActive ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                          >
                            {u.isActive ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
                            <span>{u.isActive ? 'Khóa TK' : 'Mở khóa'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? users.length} người dùng)
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
