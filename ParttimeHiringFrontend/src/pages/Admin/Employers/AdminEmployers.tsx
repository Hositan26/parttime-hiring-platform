import React, { useState, useEffect } from 'react';
import { Briefcase, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Power, PowerOff } from 'lucide-react';
import { getEmployers, updateEmployerStatus, type AdminEmployerResponse } from '../../../services/adminEmployer.service';
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
      alert('Đã cập nhật trạng thái');
      fetchList(page);
    } catch (error: any) {
      alert(error.message);
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
                      <button 
                        onClick={() => handleToggleStatus(e.employerId, e.status)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: e.status === 'ACTIVE' ? '#dc2626' : '#10b981'
                        }}
                        title={e.status === 'ACTIVE' ? 'Khóa doanh nghiệp' : 'Kích hoạt lại'}
                      >
                        {e.status === 'ACTIVE' ? <PowerOff size={20} /> : <Power size={20} />}
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
