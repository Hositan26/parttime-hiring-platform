import React, { useState, useEffect } from 'react';
import { Clock, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Plus } from 'lucide-react';
import { getShifts, createShift, updateShift, deleteShift, type AdminShift } from '../../../services/adminShift.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminShifts: React.FC = () => {
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getShifts(pageNum, 10);
      setShifts(data.content || []);
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

  const handleAdd = async () => {
    const name = window.prompt('Nhập tên ca làm việc (VD: Ca Sáng):');
    if (!name) return;
    const start = window.prompt('Nhập giờ bắt đầu (VD: 08:00:00):', '08:00:00');
    if (!start) return;
    const end = window.prompt('Nhập giờ kết thúc (VD: 12:00:00):', '12:00:00');
    if (!end) return;

    try {
      await createShift({ shiftName: name, startTime: start, endTime: end, isFlexible: false });
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = async (s: AdminShift) => {
    const name = window.prompt('Sửa tên ca làm việc:', s.shiftName);
    if (!name) return;
    try {
      await updateShift(s.shiftId, { ...s, shiftName: name });
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ca làm việc này?')) return;
    try {
      await deleteShift(id);
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Ca Làm Việc</h1>
        <p className={styles.subtitle}>Cấu hình các ca làm việc mẫu để nhà tuyển dụng chọn.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Tìm tên ca làm việc..." className={styles.searchInput} />
        </div>
        <button className={styles.btnApprove} style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={handleAdd}>
          <Plus size={18} /> Thêm ca mới
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : shifts.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} color="#cbd5e1" />
            <p>Không có ca làm việc nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Ca</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Linh hoạt</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.shiftId}>
                    <td>#{s.shiftId}</td>
                    <td style={{ fontWeight: 600 }}>{s.shiftName}</td>
                    <td style={{ color: '#64748b' }}>{s.startTime}</td>
                    <td style={{ color: '#64748b' }}>{s.endTime}</td>
                    <td>
                      {s.isFlexible ? 
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>Có</span> :
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>Không</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEdit(s)} className={styles.actionBtn} style={{ marginRight: '8px' }}>
                        <Edit3 size={16} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(s.shiftId)} className={styles.actionBtn} style={{ color: '#dc2626', background: '#fee2e2' }}>
                        <Trash2 size={16} /> Xóa
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
