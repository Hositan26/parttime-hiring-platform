import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { Star, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { deleteReview, updateReviewVisibility, type AdminReviewResponse } from '../../../services/adminReview.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminReviews: React.FC = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminReviewResponse>(`${apiBase}/admin/reviews?page=${page}&size=10&query=${encodeURIComponent(query)}`, revision);
  const reviews = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này khỏi hệ thống?')) return;
    try {
      await deleteReview(id);
      alert('Xóa thành công!');
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={14} fill={i < rating ? '#facc15' : 'none'} color={i < rating ? '#facc15' : '#cbd5e1'} />
    ));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Đánh Giá</h1>
        <p className={styles.subtitle}>Kiểm duyệt các đánh giá của ứng viên về cửa hàng.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Tìm theo tên cửa hàng hoặc người đánh giá..." className={styles.searchInput} />
        </div>
      </div>

      {(error || loadError) && <p role="alert">{error || loadError}</p>}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <Star size={48} color="#cbd5e1" />
            <p>Không có đánh giá nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cửa hàng</th>
                  <th>Người đánh giá</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th><th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.reviewId}>
                    <td>#{r.reviewId}</td>
                    <td style={{ fontWeight: 600 }}>{r.storeName}</td>
                    <td>
                      <div>{r.reviewerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>@{r.reviewerUsername}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>{renderStars(r.rating)}</div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.comment}>
                      {r.comment || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Không có nội dung</span>}
                    </td>
                    <td><span className={r.status === 'VISIBLE' ? 'badge-success' : 'badge-warning'}>{r.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-outline" onClick={async () => {
                        if (!window.confirm(r.status === 'VISIBLE' ? 'Ẩn đánh giá này?' : 'Khôi phục đánh giá này?')) return;
                        try { await updateReviewVisibility(r.reviewId, r.status !== 'VISIBLE'); setRevision(value => value + 1); }
                        catch (error) { setError(error instanceof Error ? error.message : 'Thao tác thất bại'); }
                      }}>{r.status === 'VISIBLE' ? 'Ẩn' : 'Khôi phục'}</button>
                      <button onClick={() => handleDelete(r.reviewId)} className={styles.actionBtn} style={{ color: '#dc2626', background: '#fee2e2' }}>
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
