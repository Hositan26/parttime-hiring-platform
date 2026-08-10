import React, { useState, useEffect } from 'react';
import { Briefcase, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Power, PowerOff } from 'lucide-react';
import { getEmployers, updateEmployerStatus, type AdminEmployerResponse } from '../../../services/adminEmployer.service';
import { banUser, unbanUser } from '../../../services/adminUser.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminEmployers: React.FC = () => {
  const [employers, setEmployers] = useState<AdminEmployerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getEmployers(pageNum, 10);
      setEmployers(data.content || []);
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

  const handleToggleStatus = async (employerId: number, currentStatus: string) => {
    let newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Bạn muốn chuyển trạng thái doanh nghiệp này thành ${newStatus}?`)) return;
    
    try {
      await updateEmployerStatus(employerId, newStatus);
      alert('Đã cập nhật trạng thái doanh nghiệp');
      fetchList(page);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleUserBan = async (employer: AdminEmployerResponse) => {
    const action = employer.isActive ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} TÀI KHOẢN ĐĂNG NHẬP của doanh nghiệp này?`)) return;
    
    try {
      if (employer.isActive) {
        await banUser(employer.userId);
      } else {
        await unbanUser(employer.userId);
      }
      alert(`Đã ${action} tài khoản thành công!`);
      fetchList(page);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}>Chờ duyệt</span>;
      case 'ACTIVE':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={14}/> Hoạt động</span>;
      case 'SUSPENDED':
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><XCircle size={14}/> Đã khóa</span>;
      case 'INACTIVE':
        return <span className={`${styles.badge} ${styles.badgeDanger}`}>Ngừng HĐ</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Nhà Tuyển Dụng</h1>
        <p className={styles.subtitle}>Xem danh sách và trạng thái hoạt động của doanh nghiệp.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Tìm tên doanh nghiệp..." className={styles.searchInput} />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : employers.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase size={48} color="#cbd5e1" />
            <p>Không có nhà tuyển dụng nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Công ty</th>
                  <th>Người đại diện</th>
                  <th>Liên hệ</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Khóa/Mở khóa</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((e) => (
                  <tr key={e.employerId}>
                    <td>#{e.employerId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.companyName || '-'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>User: {e.username}</div>
                    </td>
                    <td>{e.representativeName || '-'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{e.emailContact}</div>
                      <div style={{ fontSize: '0.85rem' }}>{e.phoneContact}</div>
                    </td>
                    <td>{getStatusBadge(e.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleToggleStatus(e.employerId, e.status)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: e.status === 'ACTIVE' ? '#eab308' : '#10b981',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                          title="Đổi trạng thái hồ sơ"
                        >
                          {e.status === 'ACTIVE' ? 'Tạm ngưng hồ sơ' : 'Kích hoạt hồ sơ'}
                        </button>

                        <button 
                          onClick={() => handleToggleUserBan(e)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: e.isActive ? '#ef4444' : '#64748b',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }}
                          title="Khóa/Mở khóa đăng nhập"
                        >
                          {e.isActive ? 'Khóa User' : 'Mở khóa User'}
                        </button>
                      </div>
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
