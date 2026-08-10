import React, { useState, useEffect } from 'react';
import { Clock, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Plus } from 'lucide-react';
import { getShifts, createShift, updateShift, deleteShift, type AdminShift } from '../../../services/adminShift.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminShifts: React.FC = () => {
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<AdminShift | null>(null);
  const [formData, setFormData] = useState({ shiftName: '', startTime: '08:00:00', endTime: '12:00:00', isFlexible: false });

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

  const handleAdd = () => {
    setEditingShift(null);
    setFormData({ shiftName: '', startTime: '08:00:00', endTime: '12:00:00', isFlexible: false });
    setIsModalOpen(true);
  };

  const handleEdit = (s: AdminShift) => {
    setEditingShift(s);
    setFormData({ shiftName: s.shiftName, startTime: s.startTime, endTime: s.endTime, isFlexible: s.isFlexible });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.shiftName.trim()) {
      alert('Vui lòng nhập tên ca làm việc');
      return;
    }
    try {
      if (editingShift) {
        await updateShift(editingShift.shiftId, { ...editingShift, ...formData });
      } else {
        await createShift(formData);
      }
      setIsModalOpen(false);
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

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: '400px' }}>
            <h2 className={styles.modalTitle}>{editingShift ? 'Sửa ca làm việc' : 'Thêm ca làm việc'}</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên ca làm việc (*)</label>
              <input 
                type="text" 
                className={styles.input} 
                value={formData.shiftName} 
                onChange={(e) => setFormData({...formData, shiftName: e.target.value})} 
                placeholder="VD: Ca Sáng"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Giờ bắt đầu</label>
                <input 
                  type="time" 
                  step="1"
                  className={styles.input} 
                  value={formData.startTime} 
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Giờ kết thúc</label>
                <input 
                  type="time" 
                  step="1"
                  className={styles.input} 
                  value={formData.endTime} 
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                />
              </div>
            </div>
            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input 
                type="checkbox" 
                id="isFlexible"
                checked={formData.isFlexible}
                onChange={(e) => setFormData({...formData, isFlexible: e.target.checked})}
              />
              <label htmlFor="isFlexible" style={{ margin: 0, fontWeight: 500, cursor: 'pointer' }}>Thời gian linh hoạt</label>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>Hủy</button>
              <button onClick={handleSave} className={styles.btnConfirm}>Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
