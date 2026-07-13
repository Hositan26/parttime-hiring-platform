import React, { useState, useEffect } from 'react';
import { List, Search, ChevronLeft, ChevronRight, Edit3, Trash2, Plus } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, type AdminCategory } from '../../../services/adminCategory.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await getCategories(pageNum, 10);
      setCategories(data.content || []);
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
    const name = window.prompt('Nhập tên ngành nghề mới:');
    if (!name) return;
    try {
      await createCategory({ categoryName: name, isActive: true, description: '' });
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = async (cat: AdminCategory) => {
    const name = window.prompt('Sửa tên ngành nghề:', cat.categoryName);
    if (!name || name === cat.categoryName) return;
    try {
      await updateCategory(cat.categoryId, { ...cat, categoryName: name });
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ngành nghề này?')) return;
    try {
      await deleteCategory(id);
      fetchList(page);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Ngành Nghề</h1>
        <p className={styles.subtitle}>Cấu hình các ngành nghề công việc trên hệ thống.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Tìm tên ngành nghề..." className={styles.searchInput} />
        </div>
        <button className={styles.btnApprove} style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={handleAdd}>
          <Plus size={18} /> Thêm ngành nghề
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <List size={48} color="#cbd5e1" />
            <p>Không có ngành nghề nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Ngành Nghề</th>
                  <th>Slug</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.categoryId}>
                    <td>#{c.categoryId}</td>
                    <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                    <td style={{ color: '#64748b' }}>{c.slug}</td>
                    <td style={{ color: '#64748b' }}>{c.description || '-'}</td>
                    <td>
                      {c.isActive ? 
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>Hoạt động</span> :
                        <span className={`${styles.badge} ${styles.badgeDanger}`}>Ẩn</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEdit(c)} className={styles.actionBtn} style={{ marginRight: '8px' }}>
                        <Edit3 size={16} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(c.categoryId)} className={styles.actionBtn} style={{ color: '#dc2626', background: '#fee2e2' }}>
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
