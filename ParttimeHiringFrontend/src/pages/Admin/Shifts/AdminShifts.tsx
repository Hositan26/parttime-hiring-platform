import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { Clock, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Plus, AlertCircle, X, Moon } from 'lucide-react';
import { createShift, updateShift, deleteShift, type AdminShift } from '../../../services/adminShift.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminShifts: React.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<AdminShift | null>(null);
  const [formData, setFormData] = useState({ shiftName: '', startTime: '08:00:00', endTime: '12:00:00', isFlexible: false });
  const [actionError, setActionError] = useState('');

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminShift>(
    `${apiBase}/admin/shifts?page=${page}&size=10&query=${encodeURIComponent(query)}`,
    revision
  );
  const shifts = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleAdd = () => {
    setActionError('');
    setEditingShift(null);
    setFormData({ shiftName: '', startTime: '08:00:00', endTime: '12:00:00', isFlexible: false });
    setIsModalOpen(true);
  };

  const handleEdit = (s: AdminShift) => {
    setActionError('');
    setEditingShift(s);
    setFormData({ shiftName: s.shiftName, startTime: s.startTime, endTime: s.endTime, isFlexible: s.isFlexible });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = formData.shiftName.trim();
    if (!trimmedName) {
      setActionError('Vui lòng nhập tên ca làm việc');
      return;
    }
    if (!formData.startTime || !formData.endTime || formData.startTime === formData.endTime) {
      setActionError('Giờ bắt đầu và kết thúc phải có giá trị khác nhau.');
      return;
    }
    setActionError('');
    try {
      if (editingShift) {
        await updateShift(editingShift.shiftId, {
          ...editingShift,
          shiftName: trimmedName,
          startTime: formData.startTime,
          endTime: formData.endTime,
          isFlexible: formData.isFlexible
        });
      } else {
        await createShift({
          shiftName: trimmedName,
          startTime: formData.startTime,
          endTime: formData.endTime,
          isFlexible: formData.isFlexible
        });
      }
      setIsModalOpen(false);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ca làm việc này? Thao tác chỉ cho phép nếu chưa có bài đăng nào sử dụng ca.')) return;

    try {
      await deleteShift(id);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không xóa được ca làm việc do đang có bài đăng sử dụng');
    }
  };

  const isOvernight = Boolean(formData.startTime && formData.endTime && formData.endTime < formData.startTime);
  const hasTimeError = Boolean(!formData.startTime || !formData.endTime || formData.startTime === formData.endTime);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Ca Làm Việc</h1>
        <p className={styles.subtitle}>Cấu hình các khung giờ làm việc mẫu để nhà tuyển dụng dễ dàng gán vào tin đăng.</p>
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
            placeholder="Tìm tên ca làm việc..."
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.btnApprove}
          style={{ flex: 'none' }}
          onClick={handleAdd}
        >
          <Plus size={16} />
          <span>Thêm ca mới</span>
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Clock size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách ca làm việc...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Clock size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy ca làm việc nào</h2>
            <p className={styles.emptyStateText}>Bấm "Thêm ca mới" để khởi tạo khung giờ đầu tiên.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Ca Làm</th>
                    <th>Giờ bắt đầu</th>
                    <th>Giờ kết thúc</th>
                    <th>Tính chất ca</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => {
                    const shiftOvernight = s.endTime < s.startTime;
                    return (
                      <tr key={s.shiftId}>
                        <td className={styles.idCell}>#{s.shiftId}</td>
                        <td>
                          <div className={styles.primaryText}>{s.shiftName}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{s.startTime}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{s.endTime}</span>
                            {shiftOvernight && (
                              <span
                                className={`${styles.badge} ${styles.badgeWarning}`}
                                title="Ca kết thúc vào ngày hôm sau"
                              >
                                <Moon size={11} /> Qua đêm
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {s.isFlexible ? (
                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                              Thời gian linh hoạt
                            </span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                              Cố định
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsCell}>
                            <button
                              onClick={() => handleEdit(s)}
                              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                              title="Chỉnh sửa ca làm việc"
                            >
                              <Edit3 size={14} />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => handleDelete(s.shiftId)}
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Xóa ca làm nếu chưa có bài đăng nào sử dụng"
                            >
                              <Trash2 size={14} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? shifts.length} ca làm)
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

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className={styles.modalOverlayCenter} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalDialogCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingShift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn} aria-label="Đóng hộp thoại">
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {actionError && (
                <div className={styles.alertBanner} role="alert">
                  <AlertCircle size={16} />
                  <span>{actionError}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tên ca làm việc <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  maxLength={255}
                  value={formData.shiftName}
                  onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
                  placeholder="Ví dụ: Ca sáng, Ca tối, Ca gãy..."
                  autoFocus
                />
                {!formData.shiftName.trim() && (
                  <span className={styles.formError} role="alert">
                    Tên ca không được để trống.
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Giờ bắt đầu <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    className={styles.input}
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Giờ kết thúc <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="time"
                    step="1"
                    className={styles.input}
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {hasTimeError && (
                <span className={styles.formError} role="alert">
                  Giờ bắt đầu và kết thúc phải có giá trị khác nhau.
                </span>
              )}

              {isOvernight && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.825rem', color: '#b45309' }}>
                  <Moon size={15} />
                  <span>Ca kết thúc vào ngày hôm sau (Ca qua đêm).</span>
                </div>
              )}

              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="shiftIsFlexible"
                  checked={formData.isFlexible}
                  onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#00b14f', cursor: 'pointer' }}
                />
                <label htmlFor="shiftIsFlexible" style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#334155' }}>
                  Thời gian làm việc linh hoạt
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>
                Hủy bỏ
              </button>
              <button
                disabled={!formData.shiftName.trim() || hasTimeError}
                onClick={handleSave}
                className={styles.btnConfirm}
              >
                {editingShift ? 'Lưu thay đổi' : 'Tạo ca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
