import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, XCircle, Clock, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './AdminVerifications.module.css';
import { getVerifications, getVerificationDetail, approveVerification, rejectVerification, type VerificationListResponse, type VerificationDetailResponse } from '../../../services/adminVerification.service';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminVerifications: React.FC = () => {
  const [verifications, setVerifications] = useState<VerificationListResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<VerificationDetailResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For fullscreen image view

  const fetchList = async (pageNum: number, status: string) => {
    try {
      setLoading(true);
      const data = await getVerifications(status, pageNum, 10);
      setVerifications(data.content || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, statusFilter);
  }, [page, statusFilter]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const openDetail = async (id: number) => {
    setSelectedId(id);
    setRejectMode(false);
    setRejectReason('');
    try {
      setModalLoading(true);
      const data = await getVerificationDetail(id);
      setDetail(data);
      setModalLoading(false);
    } catch (error) {
      console.error(error);
      setModalLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const handleApprove = async () => {
    if (!detail) return;
    if (!window.confirm(`Bạn chắc chắn muốn DUYỆT hồ sơ của doanh nghiệp ${detail.companyName}?`)) return;
    
    try {
      setProcessing(true);
      await approveVerification(detail.verificationId);
      alert('Đã duyệt thành công!');
      setProcessing(false);
      closeDetail();
      fetchList(page, statusFilter);
    } catch (error: any) {
      alert(error.message);
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!detail) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      setProcessing(true);
      await rejectVerification(detail.verificationId, rejectReason);
      alert('Đã từ chối hồ sơ!');
      setProcessing(false);
      closeDetail();
      fetchList(page, statusFilter);
    } catch (error: any) {
      alert(error.message);
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}><Clock size={14}/> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={14}/> Đã duyệt</span>;
      case 'REJECTED':
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><XCircle size={14}/> Từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Xét duyệt Doanh nghiệp</h1>
        <p className={styles.subtitle}>Kiểm tra tính hợp lệ của giấy tờ kinh doanh và cấp huy hiệu xác minh.</p>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${statusFilter === 'PENDING' ? styles.activeTab : ''}`} onClick={() => handleFilterChange('PENDING')}>
            Chờ duyệt
          </button>
          <button className={`${styles.tab} ${statusFilter === 'APPROVED' ? styles.activeTab : ''}`} onClick={() => handleFilterChange('APPROVED')}>
            Đã duyệt
          </button>
          <button className={`${styles.tab} ${statusFilter === 'REJECTED' ? styles.activeTab : ''}`} onClick={() => handleFilterChange('REJECTED')}>
            Đã từ chối
          </button>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Tìm tên công ty, MST..." className={styles.searchInput} />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : verifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} color="#cbd5e1" />
            <p>Không có hồ sơ nào trong danh sách này.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Doanh Nghiệp</th>
                  <th>Mã số thuế</th>
                  <th>Tài khoản nộp</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v.verificationId}>
                    <td>#{v.verificationId}</td>
                    <td style={{ fontWeight: 600 }}>{v.companyName}</td>
                    <td>{v.taxCode || '-'}</td>
                    <td>{v.username}</td>
                    <td>{v.submittedAt ? new Date(v.submittedAt).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>{getStatusBadge(v.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.actionBtn} onClick={() => openDetail(v.verificationId)}>
                        <Eye size={16} /> Xem
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className={styles.modalOverlay} onClick={closeDetail}>
            <motion.div 
              className={styles.modalContent} 
              onClick={e => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={styles.modalHeader}>
                <h2>Chi tiết hồ sơ xác minh</h2>
                <button onClick={closeDetail} className={styles.closeBtn}><X size={24} /></button>
              </div>
              
              <div className={styles.modalBody}>
                {modalLoading ? (
                  <div className={styles.loadingState}>Đang tải chi tiết...</div>
                ) : detail ? (
                  <>
                    <div className={styles.infoSection}>
                      <h3>Thông tin khai báo</h3>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <label>Tên công ty</label>
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
                          <div>{detail.username}</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.docsSection}>
                      <h3>Tài liệu đính kèm</h3>
                      <div className={styles.docsGrid}>
                        {[
                          { name: 'CCCD mặt trước', img: detail.idCardFrontUrl },
                          { name: 'CCCD mặt sau', img: detail.idCardBackUrl },
                          { name: 'Giấy phép kinh doanh', img: detail.businessLicenseUrl },
                          { name: 'Ảnh mặt tiền', img: detail.storeFrontImageUrl },
                        ].map((doc, idx) => doc.img && (
                          <div key={idx} className={styles.docCard}>
                            <div className={styles.docImgWrapper} onClick={() => setSelectedImage(doc.img)}>
                              <img src={doc.img} alt={doc.name} />
                              <div className={styles.docHover}>
                                <Eye size={24} /> Phóng to
                              </div>
                            </div>
                            <div className={styles.docName}>{doc.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {detail.status === 'PENDING' && (
                      <div className={styles.modalFooter}>
                        {!rejectMode ? (
                          <>
                            <button className={styles.btnReject} onClick={() => setRejectMode(true)} disabled={processing}>
                              <XCircle size={18} /> Từ chối
                            </button>
                            <button className={styles.btnApprove} onClick={handleApprove} disabled={processing}>
                              <CheckCircle2 size={18} /> Phê duyệt hợp lệ
                            </button>
                          </>
                        ) : (
                          <div className={styles.rejectForm}>
                            <label>Lý do từ chối:</label>
                            <textarea 
                              placeholder="Nhập lý do chi tiết..." 
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              rows={3}
                            />
                            <div className={styles.rejectActions}>
                              <button onClick={() => setRejectMode(false)} className={styles.btnCancel}>Hủy</button>
                              <button onClick={handleRejectSubmit} className={styles.btnRejectConfirm} disabled={processing}>
                                Xác nhận từ chối
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>Lỗi tải dữ liệu</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image View */}
      <AnimatePresence>
        {selectedImage && (
          <div className={styles.fullscreenOverlay} onClick={() => setSelectedImage(null)}>
            <motion.img 
              src={selectedImage} 
              alt="Fullscreen" 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className={styles.closeFullscreenBtn} onClick={() => setSelectedImage(null)}><X size={32} /></button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
