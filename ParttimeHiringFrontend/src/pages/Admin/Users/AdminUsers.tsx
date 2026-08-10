import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Mail, Calendar } from 'lucide-react';
import { getUsers, banUser, unbanUser, type AdminUserResponse } from '../../../services/adminUser.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getUsers(pageNum, 10);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

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
      fetchList(page);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Người Tìm Việc</h1>
        <p className={styles.subtitle}>Xem danh sách và thông tin tài khoản ứng viên.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Tìm tên, email..." className={styles.searchInput} />
        </div>
      </div>

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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <Mail size={14} /> {u.email || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
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
                        <span style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>Hoạt động</span>
                      ) : (
                        <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>Bị khóa</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleBan(u)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: u.isActive ? '#ef4444' : '#10b981',
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
