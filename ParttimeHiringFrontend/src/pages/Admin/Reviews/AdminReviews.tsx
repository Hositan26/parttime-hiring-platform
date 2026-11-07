import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { Star, Search, ChevronLeft, ChevronRight, Trash2, CheckCircle2, EyeOff, AlertCircle, Store } from 'lucide-react';
import { deleteReview, updateReviewVisibility, type AdminReviewResponse } from '../../../services/adminReview.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminReviews: React.FC = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminReviewResponse>(
    `${apiBase}/admin/reviews?page=${page}&size=10&query=${encodeURIComponent(query)}`,
    revision
  );
  const reviews = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này khỏi hệ thống? Thao tác không thể hoàn tác.')) return;

    try {
      await deleteReview(id);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const handleToggleVisibility = async (r: AdminReviewResponse) => {
    const isCurrentlyVisible = r.status === 'VISIBLE';
    const confirmMsg = isCurrentlyVisible
      ? 'Ẩn đánh giá này? Đánh giá bị ẩn sẽ không hiển thị công khai trên trang cửa hàng.'
      : 'Khôi phục hiển thị đánh giá này trên trang công khai?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateReviewVisibility(r.reviewId, !isCurrentlyVisible);
      setRevision(value => value + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#f59e0b' : 'none'}
        color={i < rating ? '#f59e0b' : '#cbd5e1'}
      />
    ));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Đánh Giá Cửa Hàng</h1>
        <p className={styles.subtitle}>Kiểm duyệt các phản hồi, nhận xét của ứng viên về trải nghiệm làm việc tại cửa hàng.</p>
      </div>

      {(error || loadError) && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{error || loadError}</span>
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
            placeholder="Tìm theo tên cửa hàng hoặc người đánh giá..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Star size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Star size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy đánh giá nào</h2>
            <p className={styles.emptyStateText}>Hãy thử tìm kiếm với tên cửa hàng hoặc người đánh giá khác.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cơ sở được đánh giá</th>
                    <th>Người đánh giá</th>
                    <th>Điểm số</th>
                    <th>Nội dung nhận xét</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => {
                    const isVisible = r.status === 'VISIBLE';
                    return (
                      <tr key={r.reviewId}>
                        <td className={styles.idCell}>#{r.reviewId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Store size={15} color="#00b14f" />
                            <span className={styles.primaryText}>{r.storeName}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatarSmall}>
                              {(r.reviewerName || r.reviewerUsername || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.reviewerName}</div>
                              <div className={styles.subText}>@{r.reviewerUsername}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {renderStars(r.rating)}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginLeft: '4px' }}>
                              {r.rating}.0
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: '320px' }} title={r.comment}>
                          {r.comment ? (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: '#334155',
                                lineHeight: 1.4,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              "{r.comment}"
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Không có nhận xét viết kèm
                            </span>
                          )}
                        </td>
                        <td>
                          {isVisible ? (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                              <CheckCircle2 size={13} /> Hiển thị
                            </span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeWarning}`}>
                              <EyeOff size={13} /> Đã ẩn
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionsCell}>
                            <button
                              className={`${styles.actionBtn} ${isVisible ? styles.actionBtnWarning : styles.actionBtnPrimary}`}
                              onClick={() => handleToggleVisibility(r)}
                              title={isVisible ? 'Ẩn đánh giá này khỏi hiển thị công khai' : 'Khôi phục hiển thị đánh giá'}
                            >
                              {isVisible ? <EyeOff size={14} /> : <CheckCircle2 size={14} />}
                              <span>{isVisible ? 'Ẩn' : 'Khôi phục'}</span>
                            </button>

                            <button
                              onClick={() => handleDelete(r.reviewId)}
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Xóa vĩnh viễn đánh giá này"
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
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? reviews.length} đánh giá)
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
    </div>
  );
};
