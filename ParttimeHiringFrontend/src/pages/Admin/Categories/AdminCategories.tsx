import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { List, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Plus, AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory, type AdminCategory } from '../../../services/adminCategory.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminCategories: React.FC = () => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '', isActive: true });
  const [actionError, setActionError] = useState('');

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminCategory>(
    `${apiBase}/admin/categories?page=${page}&size=10&query=${encodeURIComponent(query)}`,
    revision
  );
  const categories = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleAdd = () => {
    setActionError('');
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (cat: AdminCategory) => {
    setActionError('');
    setEditingCategory(cat);
    setFormData({ categoryName: cat.categoryName, description: cat.description || '', isActive: cat.isActive });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = formData.categoryName.trim();
    if (!trimmedName) {
      setActionError('Vui lòng nhập tên ngành nghề.');
      return;
    }
    setActionError('');
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, {
          ...editingCategory,
          categoryName: trimmedName,
          description: formData.description,
          isActive: formData.isActive
        });
      } else {
        await createCategory({
          categoryName: trimmedName,
          description: formData.description,
          isActive: formData.isActive
        });
      }
      setIsModalOpen(false);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ngành nghề này? Thao tác chỉ cho phép nếu chưa có bài đăng nào sử dụng ngành nghề.')) return;

    try {
      await deleteCategory(id);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không xóa được ngành nghề do đang có bài đăng sử dụng');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Ngành Nghề Tuyển Dụng</h1>
        <p className={styles.subtitle}>Thiết lập danh mục các ngành nghề để nhà tuyển dụng gắn thẻ công việc và ứng viên dễ tìm kiếm.</p>
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
            placeholder="Tìm tên ngành nghề, mã slug..."
            className={styles.searchInput}
          />
        </div>

        <button
          className={`${styles.btnApprove}`}
          style={{ flex: 'none' }}
          onClick={handleAdd}
        >
          <Plus size={16} />
          <span>Thêm ngành nghề mới</span>
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <List size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách ngành nghề...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <List size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy ngành nghề nào</h2>
            <p className={styles.emptyStateText}>Bấm "Thêm ngành nghề mới" để khởi tạo danh mục đầu tiên.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Ngành Nghề</th>
                    <th>Slug URL</th>
                    <th>Mô tả chi tiết</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.categoryId}>
                      <td className={styles.idCell}>#{c.categoryId}</td>
                      <td>
                        <div className={styles.primaryText}>{c.categoryName}</div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.8rem', color: '#059669', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {c.slug}
                        </code>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '300px' }}>
                        {c.description || '-'}
                      </td>
                      <td>
                        {c.isActive ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <CheckCircle2 size={13} /> Hoạt động
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <XCircle size={13} /> Tạm ẩn
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            onClick={() => handleEdit(c)}
                            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            title="Chỉnh sửa thông tin ngành nghề"
                          >
                            <Edit3 size={14} />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={() => handleDelete(c.categoryId)}
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            title="Xóa ngành nghề nếu chưa có tin tuyển dụng nào sử dụng"
                          >
                            <Trash2 size={14} />
                            <span>Xóa</span>
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
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? categories.length} ngành nghề)
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
                {editingCategory ? 'Chỉnh sửa ngành nghề' : 'Thêm ngành nghề mới'}
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
                  Tên ngành nghề <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  maxLength={255}
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="Ví dụ: Phục vụ - F&B, Thu ngân, Gia sư..."
                  autoFocus
                />
                {!formData.categoryName.trim() && (
                  <span className={styles.formError} role="alert">
                    Tên ngành nghề không được để trống.
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả ngành nghề</label>
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả phạm vi hoặc lưu ý cho ngành nghề này..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#00b14f', cursor: 'pointer' }}
                />
                <label htmlFor="categoryIsActive" style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#334155' }}>
                  Kích hoạt hiển thị cho nhà tuyển dụng chọn
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setIsModalOpen(false)} className={styles.btnCancel}>
                Hủy bỏ
              </button>
              <button
                disabled={!formData.categoryName.trim()}
                onClick={handleSave}
                className={styles.btnConfirm}
              >
                {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
