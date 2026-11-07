import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import { useAuth } from '../../../context/authContext';
import React, { useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Mail, Calendar } from 'lucide-react';
import { banUser, unbanUser, type AdminUserResponse } from '../../../services/adminUser.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [page, setPage] = useState(0);

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminUserResponse>(`${apiBase}/admin/users?page=${page}&size=10&query=${encodeURIComponent(query)}${active ? `&active=${active}` : ''}`, revision);
  const users = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleToggleBan = async (user: AdminUserResponse) => {
    const action = user.isActive ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.username}?`)) return;

    try {
      if (user.isActive) {
        await banUser(user.id);
      } else {
        await unbanUser(user.id);
      }
      alert(`Đã ${action} thành công!`);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý tài khoản người dùng</h1>
        <p className={styles.subtitle}>Xem danh sách và thông tin tài khoản ứng viên.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Tìm tên, email..." className={styles.searchInput} />
        </div>
      </div>

      <select aria-label="Trạng thái tài khoản" className="input-base" value={active} onChange={event => { setActive(event.target.value); setPage(0); }}>
        <option value="">Tất cả trạng thái</option><option value="true">Hoạt động</option><option value="false">Bị khóa</option>
      </select>
      {loadError && <p role="alert">{loadError}</p>}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} color="#cbd5e1" />
            <p>Không có người dùng nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Ngày sinh</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-gray)' }}>
                          {(u.displayName || u.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
                        <Mail size={14} /> {u.email || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}>
                        <Calendar size={14} /> {u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {u.roles.map(r => (
                          <span key={r} style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span style={{ padding: '4px 8px', backgroundColor: 'var(--primary-light)', color: '#166534', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>Hoạt động</span>
                      ) : (
                        <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>Bị khóa</span>
                      )}
                    </td>
                    <td>
                      <button
                        disabled={u.username === currentUser?.username} title={u.username === currentUser?.username ? 'Không thể tự khóa tài khoản' : undefined}
                        onClick={() => handleToggleBan(u)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: u.isActive ? '#ef4444' : 'var(--primary)',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.85rem'
                        }}
                      >
                        {u.isActive ? 'Khóa' : 'Mở khóa'}
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
