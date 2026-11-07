import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState, useRef } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Clock, FileText, ChevronLeft, ChevronRight, X, AlertCircle, Building2, User, Globe, MapPin, Calendar } from 'lucide-react';
import styles from './AdminVerifications.module.css';
import { getVerificationDetail, approveVerification, rejectVerification, type VerificationListResponse, type VerificationDetailResponse } from '../../../services/adminVerification.service';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminVerifications: React.FC = () => {
  const [query, setQuery] = useState('');
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);

  // Modal State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<VerificationDetailResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const detailRequest = useRef(0);
  const [detailError, setDetailError] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For fullscreen image view

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<VerificationListResponse>(
    `${apiBase}/admin/verifications?page=${page}&size=10&query=${encodeURIComponent(query)}&status=${statusFilter}`,
    revision
  );
  const verifications = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const openDetail = async (id: number) => {
    const requestId = ++detailRequest.current;
    setDetailError('');
    setDetail(null);
    setFailedImages([]);
    setSelectedId(id);
    setRejectMode(false);
    setRejectReason('');
    try {
      setModalLoading(true);
      const resData = await getVerificationDetail(id);
      if (requestId !== detailRequest.current) return;
      setDetail(resData);
      setModalLoading(false);
    } catch (error) {
      if (requestId !== detailRequest.current) return;
      setDetailError(error instanceof Error ? error.message : 'Không tải được chi tiết');
      setModalLoading(false);
    }
  };

  const closeDetail = () => {
    detailRequest.current += 1;
    setSelectedId(null);
    setDetail(null);
  };

  const handleApprove = async () => {
    if (!detail) return;
    if (!window.confirm(`Bạn chắc chắn muốn DUYỆT hồ sơ của doanh nghiệp ${detail.companyName}? Doanh nghiệp sẽ được cấp vai trò EMPLOYER chính thức.`)) return;

    try {
      setProcessing(true);
      await approveVerification(detail.verificationId);
      setProcessing(false);
      closeDetail();
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Thao tác thất bại');
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!detail) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessing(true);
      await rejectVerification(detail.verificationId, trimmedReason);
      setProcessing(false);
      closeDetail();
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Thao tác thất bại');
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className={`${styles.badge} ${styles.badgeWarning}`}>
            <Clock size={13} /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <CheckCircle2 size={13} /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <XCircle size={13} /> Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Xét duyệt Doanh nghiệp</h1>
        <p className={styles.subtitle}>Kiểm tra tính hợp lệ của giấy tờ kinh doanh, CCCD và cấp quyền tuyển dụng chính thức.</p>
      </div>

      {loadError && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{loadError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={styles.filtersCard}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${statusFilter === 'PENDING' ? styles.activeTab : ''}`}
            onClick={() => handleFilterChange('PENDING')}
          >
            Chờ duyệt
          </button>
          <button
            className={`${styles.tab} ${statusFilter === 'APPROVED' ? styles.activeTab : ''}`}
            onClick={() => handleFilterChange('APPROVED')}
          >
            Đã duyệt
          </button>
          <button
            className={`${styles.tab} ${statusFilter === 'REJECTED' ? styles.activeTab : ''}`}
            onClick={() => handleFilterChange('REJECTED')}
          >
            Đã từ chối
          </button>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={event => { setQuery(event.target.value); setPage(0); }}
            placeholder="Tìm tên công ty, MST..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <Clock size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách hồ sơ xác minh...</p>
          </div>
        ) : verifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <FileText size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không có hồ sơ nào</h2>
            <p className={styles.emptyStateText}>Không có yêu cầu xác minh nào trong mục trạng thái này.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Doanh Nghiệp</th>
                    <th>Mã số thuế</th>
                    <th>Tài khoản nộp</th>
                    <th>Ngày nộp hồ sơ</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.verificationId}>
                      <td className={styles.idCell}>#{v.verificationId}</td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarSmall} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div className={styles.primaryText}>{v.companyName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                          {v.taxCode || '-'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                          <User size={14} color="#94a3b8" />
                          <span>@{v.username}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.85rem' }}>
                          <Calendar size={14} color="#94a3b8" />
                          <span>{v.submittedAt ? new Date(v.submittedAt).toLocaleDateString('vi-VN') : '-'}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(v.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                            onClick={() => openDetail(v.verificationId)}
                            title="Xem chi tiết hồ sơ và giấy tờ đính kèm"
                          >
                            <Eye size={14} />
                            <span>Xem hồ sơ</span>
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
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? verifications.length} hồ sơ)
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

      {/* Detail Slide-over Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className={styles.modalOverlay} onClick={closeDetail}>
            <motion.div
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              <div className={styles.modalHeader}>
                <div>
                  <span className={styles.idCell}>Hồ sơ #{selectedId}</span>
                  <h2 className={styles.modalTitle} style={{ marginTop: '2px' }}>Chi tiết hồ sơ xác minh</h2>
                </div>
                <button onClick={closeDetail} className={styles.closeBtn} aria-label="Đóng chi tiết">
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {modalLoading ? (
                  <div className={styles.loadingState}>
                    <div className={styles.emptyIconWrapper}>
                      <Clock size={28} />
                    </div>
                    <p className={styles.emptyStateText}>Đang tải tài liệu xác minh...</p>
                  </div>
                ) : detail ? (
                  <>
                    <div className={styles.infoSection}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Thông tin định danh doanh nghiệp</h3>
                        <div>{getStatusBadge(detail.status)}</div>
                      </div>

                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <label>Tên doanh nghiệp</label>
                          <div>{detail.companyName}</div>
                        </div>
                        <div className={styles.infoItem}>
                          <label>Mã số thuế</label>
                          <div>{detail.taxCode || 'Không có'}</div>
                        </div>
                        <div className={styles.infoItem}>
                          <label>Người đại diện</label>
                          <div>{detail.representativeName}</div>
                        </div>
                        <div className={styles.infoItem}>
                          <label>Số điện thoại</label>
                          <div>{detail.phoneContact}</div>
                        </div>
                        <div className={styles.infoItem}>
                          <label>Email liên hệ</label>
                          <div>{detail.contactEmail}</div>
                        </div>
                        <div className={styles.infoItem}>
                          <label>Tài khoản nộp</label>
                          <div>@{detail.username}</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={16} color="#00b14f" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>Địa chỉ:</strong> {detail.address}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Globe size={16} color="#00b14f" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>Website / Fanpage:</strong> {detail.websiteFanpageUrl || 'Không cung cấp'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Calendar size={16} color="#00b14f" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>Ngày nộp:</strong> {detail.submittedAt ? new Date(detail.submittedAt).toLocaleString('vi-VN') : '-'}</span>
                        </div>
                        {detail.rejectionReason && (
                          <div style={{ marginTop: '6px', padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}>
                            <strong>Lý do từ chối trước đó:</strong> {detail.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attached Documents */}
                    <div className={styles.docsSection}>
                      <h3>Giấy tờ & Hình ảnh đính kèm</h3>
                      <div className={styles.docsGrid}>
                        {[
                          { name: 'CCCD mặt trước', img: detail.idCardFrontUrl },
                          { name: 'CCCD mặt sau', img: detail.idCardBackUrl },
                          { name: 'Giấy phép kinh doanh', img: detail.businessLicenseUrl },
                          { name: 'Ảnh mặt tiền cơ sở', img: detail.storeFrontImageUrl },
                        ].map((doc, idx) => (
                          <div key={idx} className={styles.docCard}>
                            <div
                              className={styles.docImgWrapper}
                              onClick={() => {
                                if (doc.img && !failedImages.includes(doc.img)) {
                                  setSelectedImage(doc.img);
                                }
                              }}
                            >
                              {!doc.img ? (
                                <p className={styles.docPlaceholder}>Không cung cấp tài liệu</p>
                              ) : failedImages.includes(doc.img) ? (
                                <p className={styles.docPlaceholder} role="status">Không tải được ảnh</p>
                              ) : (
                                <img
                                  src={doc.img}
                                  alt={doc.name}
                                  onError={() => setFailedImages(prev => [...prev, doc.img!])}
                                />
                              )}
                              {doc.img && !failedImages.includes(doc.img) && (
                                <div className={styles.docHover}>
                                  <Eye size={20} />
                                  <span>Phóng to</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.docName}>{doc.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions for PENDING verifications */}
                    {detail.status === 'PENDING' && (
                      <div className={styles.modalFooter}>
                        {!rejectMode ? (
                          <>
                            <button
                              className={styles.btnReject}
                              onClick={() => setRejectMode(true)}
                              disabled={processing}
                            >
                              <XCircle size={16} />
                              <span>Từ chối hồ sơ</span>
                            </button>
                            <button
                              className={styles.btnApprove}
                              onClick={handleApprove}
                              disabled={processing}
                            >
                              <CheckCircle2 size={16} />
                              <span>{processing ? 'Đang duyệt...' : 'Phê duyệt hợp lệ'}</span>
                            </button>
                          </>
                        ) : (
                          <div className={styles.rejectForm}>
                            <label>Lý do từ chối (bắt buộc để ứng viên xem):</label>
                            <textarea
                              placeholder="Nhập lý do chi tiết (ví dụ: ảnh CCCD bị mờ, thiếu giấy phép đăng ký kinh doanh...)"
                              value={rejectReason}
                              maxLength={500}
                              onChange={e => setRejectReason(e.target.value)}
                              rows={3}
                              className={styles.textarea}
                              autoFocus
                            />
                            {!rejectReason.trim() && (
                              <p className={styles.formError} role="alert">
                                Vui lòng nhập lý do từ chối.
                              </p>
                            )}
                            <div className={styles.rejectActions}>
                              <button
                                onClick={() => setRejectMode(false)}
                                className={styles.btnCancel}
                                disabled={processing}
                              >
                                Quay lại
                              </button>
                              <button
                                onClick={handleRejectSubmit}
                                className={styles.btnRejectConfirm}
                                disabled={processing || !rejectReason.trim()}
                              >
                                {processing ? 'Đang gửi...' : 'Xác nhận từ chối'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState} role="alert">
                    <AlertCircle size={32} color="#dc2626" />
                    <p>{detailError || 'Không tải được chi tiết'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Lightbox View */}
      <AnimatePresence>
        {selectedImage && (
          <div className={styles.fullscreenOverlay} onClick={() => setSelectedImage(null)}>
            <motion.img
              src={selectedImage}
              alt="Fullscreen document view"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className={styles.closeFullscreenBtn}
              onClick={() => setSelectedImage(null)}
              aria-label="Đóng xem ảnh"
            >
              <X size={24} />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
