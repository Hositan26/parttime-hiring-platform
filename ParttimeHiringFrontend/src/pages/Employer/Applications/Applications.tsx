import { matchesEmployerSearch } from '../../../services/employerSearch';
import { useApiResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle2, XCircle, Eye, MapPin, Search, CheckCircle, X, ExternalLink, MessageSquare, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Applications.module.css';
import { updateApplicationStatus, type EmployerApplicationResponse } from '../../../services/application.service';
import { getEmployerStores, type EmployerStoreDTO } from '../../../services/storeApi';
import { ProfileModal } from '../../../components/ProfileModal/ProfileModal';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<EmployerStoreDTO[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EmployerApplicationResponse | null>(null);
  
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals for Accept & Reject
  const [acceptingApp, setAcceptingApp] = useState<EmployerApplicationResponse | null>(null);
  const [rejectingApp, setRejectingApp] = useState<EmployerApplicationResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [revision, setRevision] = useState(0);
  const params = new URLSearchParams();
  if (selectedStoreId) params.set('storeId', String(selectedStoreId));
  if (selectedStatus !== 'all') params.set('status', selectedStatus);
  const { data, loading, error } = useApiResource<EmployerApplicationResponse[]>(`${apiBase}/employer/applications?${params}`, revision);
  const applications = data || [];
  const visibleApplications = applications.filter(application =>
    matchesEmployerSearch(search, application.applicantName, application.jobTitle, application.storeName));

  useEffect(() => {
    getEmployerStores('newest').then(response => setStores(response.stores)).catch(console.error);
  }, []);

  const handleConfirmAccept = async () => {
    if (!acceptingApp) return;
    setProcessing(true);
    setActionError('');
    try {
      await updateApplicationStatus(acceptingApp.applicationId, 'ACCEPTED');
      setAcceptingApp(null);
      setActionSuccess(`Đã chấp nhận ứng viên ${acceptingApp.applicantName}! Hệ thống đã tạo hồ sơ nhân sự chính thức.`);
      setTimeout(() => setActionSuccess(''), 4000);
      setRevision(value => value + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi duyệt ứng viên.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;
    const trimmed = rejectionReason.trim();
    if (!trimmed || trimmed.length > 500) {
      setReasonError('Vui lòng nhập lý do từ chối từ 1 đến 500 ký tự để phản hồi cho ứng viên.');
      return;
    }
    setProcessing(true);
    setActionError('');
    try {
      await updateApplicationStatus(rejectingApp.applicationId, 'REJECTED', trimmed);
      setRejectingApp(null);
      setRejectionReason('');
      setActionSuccess(`Đã từ chối đơn ứng tuyển của ${rejectingApp.applicantName} kèm lý do phản hồi.`);
      setTimeout(() => setActionSuccess(''), 4000);
      setRevision(value => value + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi từ chối đơn.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': 
        return <span className="badge-warning"><Clock size={12} /> Chờ xử lý</span>;
      case 'ACCEPTED': 
        return <span className="badge-success"><CheckCircle2 size={12} /> Đã chấp nhận</span>;
      case 'REJECTED': 
        return <span className="badge-danger"><XCircle size={12} /> Đã từ chối</span>;
      case 'WITHDRAWN': 
        return <span className="badge-neutral"><AlertCircle size={12} /> Đã rút đơn</span>;
      default: 
        return <span className="badge-neutral">{status}</span>;
    }
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
  const totalCount = applications.length;

  return (
    <div className={styles.appsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đơn ứng tuyển</h1>
          <p className={styles.subtitle}>Theo dõi, xem xét hồ sơ/CV, liên hệ phỏng vấn và xử lý tuyển dụng ứng viên.</p>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="status">
          <CheckCircle2 size={16} color="var(--success)" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {(error || actionError) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="alert">
          <AlertCircle size={16} />
          <span>{error || actionError}</span>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng đơn ứng tuyển</div>
            <div className={styles.statValue}>{totalCount}</div>
            <div className={styles.statSub}>Tất cả các tin tuyển dụng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đang chờ xử lý</div>
            <div className={styles.statValue}>{pendingCount}</div>
            <div className={styles.statSub}>{totalCount > 0 ? Math.round((pendingCount/totalCount)*100) : 0}% tổng đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã chấp nhận</div>
            <div className={styles.statValue}>{acceptedCount}</div>
            <div className={styles.statSub}>{totalCount > 0 ? Math.round((acceptedCount/totalCount)*100) : 0}% tổng đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <XCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã từ chối</div>
            <div className={styles.statValue}>{rejectedCount}</div>
            <div className={styles.statSub}>{totalCount > 0 ? Math.round((rejectedCount/totalCount)*100) : 0}% tổng đơn</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input 
              type="search" 
              aria-label="Tìm kiếm đơn ứng tuyển" 
              placeholder="Tìm kiếm ứng viên, tên job, tên store..." 
              value={search} 
              onChange={event => setSearch(event.target.value)} 
            />
          </div>
          <div className={styles.filtersGroup}>
            <select 
              className={styles.select} 
              value={selectedStoreId} 
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            >
              <option value={0}>Tất cả cửa hàng</option>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>{store.name}</option>
              ))}
            </select>
            <select 
              className={styles.select}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="ACCEPTED">Đã chấp nhận</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="WITHDRAWN">Đã rút đơn</option>
            </select>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ỨNG VIÊN</th>
                <th>CÔNG VIỆC & CƠ SỞ</th>
                <th>NGÀY ỨNG TUYỂN</th>
                <th>TRẠNG THÁI</th>
                <th>HỒ SƠ & CV</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-gray)' }}>
                    Đang tải danh sách đơn ứng tuyển...
                  </td>
                </tr>
              ) : visibleApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-gray)' }}>
                    {search.trim() ? 'Không tìm thấy đơn ứng tuyển nào phù hợp với bộ lọc.' : 'Chưa có đơn ứng tuyển nào.'}
                  </td>
                </tr>
              ) : visibleApplications.map((app) => {
                const isWithdrawn = app.status === 'WITHDRAWN';

                return (
                  <tr key={app.applicationId}>
                    <td>
                      <div className={styles.candidateInfo}>
                        <img 
                          src={app.applicantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName)}&background=random`} 
                          alt="avatar" 
                          className={styles.avatar} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName)}&background=random`;
                          }}
                        />
                        <div>
                          <div className={styles.candidateName}>{app.applicantName}</div>
                          <div className={styles.candidateContact}>
                            <span>{app.applicantPhone || 'Chưa có SĐT'}</span>
                            {app.applicantEmail && <span>• {app.applicantEmail}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.jobStoreInfo}>
                        <div className={styles.jobTitle}>{app.jobTitle}</div>
                        <div className={styles.storeInfoText}>
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{app.storeName}</div>
                          <div className={styles.storeInfo}>
                            <MapPin size={13} style={{ flexShrink: 0, color: 'var(--primary)' }} /> 
                            <span style={{ fontSize: '0.8rem' }}>{app.storeAddress}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCol}>
                        <div className={styles.dateText}>{app.appliedDate}</div>
                        <div className={styles.timeText}>{app.appliedTime}</div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(app.status)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <Link 
                            to={`/applications/${app.applicationId}/conversation`}
                            className="btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            title="Mở kênh trao đổi / phỏng vấn"
                          >
                            <MessageSquare size={13} /> Trao đổi
                          </Link>

                          {isWithdrawn ? (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                padding: '0.35rem 0.65rem', 
                                fontSize: '0.75rem', 
                                color: 'var(--text-light)', 
                                background: 'var(--bg-lighter)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'not-allowed'
                              }}
                              title="Ứng viên đã rút đơn nên quyền truy cập CV đã bị thu hồi"
                            >
                              <ShieldAlert size={13} /> CV đã thu hồi
                            </span>
                          ) : (
                            <Link 
                              to={`/candidate-profile/applications/${app.applicationId}`}
                              className="btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="Xem hồ sơ và tải CV ứng viên"
                            >
                              <FileText size={13} /> Xem CV
                            </Link>
                          )}

                          <button 
                            type="button"
                            className={styles.viewProfileBtn} 
                            onClick={() => setSelectedProfile(app)}
                            title="Xem nhanh thông tin"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <div className={styles.actionGroup}>
                          {app.status === 'PENDING' && (
                            <>
                              <button 
                                type="button"
                                className={styles.btnApprove} 
                                onClick={() => setAcceptingApp(app)}
                                title="Chấp nhận tuyển dụng ứng viên này"
                              >
                                <CheckCircle size={15} /> Duyệt
                              </button>
                              <button 
                                type="button"
                                className={styles.btnReject} 
                                onClick={() => {
                                  setRejectingApp(app);
                                  setRejectionReason('');
                                  setReasonError('');
                                }}
                                title="Từ chối ứng viên có lý do phản hồi"
                              >
                                <X size={15} /> Từ chối
                              </button>
                            </>
                          )}
                          {app.status === 'ACCEPTED' && (
                            <button 
                              type="button"
                              className={styles.btnApprove} 
                              style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
                              onClick={() => navigate('/employer/employees')}
                              title="Xem trong danh sách Nhân sự"
                            >
                              <ExternalLink size={14} /> Nhân sự
                            </button>
                          )}
                          {app.status === 'REJECTED' && (
                            <button 
                              type="button"
                              className={styles.btnApprove} 
                              onClick={() => setAcceptingApp(app)}
                              title="Xem xét lại và Chấp nhận ứng viên"
                            >
                              <CheckCircle size={15} /> Duyệt lại
                            </button>
                          )}
                          {isWithdrawn && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                              Đã đóng
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: XÁC NHẬN CHẤP NHẬN ỨNG VIÊN (QUYẾT ĐỊNH CUỐI CÙNG) */}
      {acceptingApp && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setAcceptingApp(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
              Xác nhận duyệt nhận ứng viên?
            </h3>
            
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '12px' }}>
              {acceptingApp.applicantName} — {acceptingApp.jobTitle}
            </p>

            <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'left', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400E', lineHeight: '1.5' }}>
                ⚠️ <strong>Quyết định cuối cùng:</strong> Khi xác nhận chấp nhận đơn, hệ thống sẽ tự động tạo hồ sơ nhân sự chính thức và thêm ứng viên vào danh sách nhân viên của cơ sở. Doanh nghiệp sẽ chủ động liên hệ trực tiếp với ứng viên để sắp xếp thời gian làm việc.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => setAcceptingApp(null)} 
                disabled={processing}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmAccept} 
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận Chấp nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TỪ CHỐI ĐƠN ỨNG TUYỂN BẮT BUỘC CÓ LÝ DO */}
      {rejectingApp && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setRejectingApp(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-dark)' }}>
                    Từ chối đơn ứng tuyển
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                    Ứng viên: {rejectingApp.applicantName}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectingApp(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '1rem', lineHeight: '1.5' }}>
              Theo quy tắc hệ thống, <strong>loại CV phải có lý do cụ thể</strong> để gửi thông báo giải thích cho ứng viên.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                  Lý do từ chối <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea 
                  className="input-base" 
                  value={rejectionReason}
                  maxLength={500}
                  required
                  rows={4}
                  placeholder="Ví dụ: Vị trí đã tuyển đủ số lượng, hoặc ca làm việc của bạn chưa phù hợp với lịch của quán hiện tại..."
                  onChange={e => {
                    setRejectionReason(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                  style={{ resize: 'vertical' }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
                  <span>{reasonError && <span style={{ color: 'var(--danger)' }}>{reasonError}</span>}</span>
                  <span>{rejectionReason.length} / 500 ký tự</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setRejectingApp(null)} 
                  disabled={processing}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-danger" 
                  disabled={processing || !rejectionReason.trim() || rejectionReason.trim().length > 500}
                >
                  {processing ? 'Đang gửi...' : 'Xác nhận Từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Profile Modal */}
      <ProfileModal 
        isOpen={!!selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
        profile={selectedProfile ? {
          applicantName: selectedProfile.applicantName,
          applicantAvatar: selectedProfile.applicantAvatar,
          applicantEmail: selectedProfile.applicantEmail,
          applicantPhone: selectedProfile.applicantPhone,
          jobTitle: selectedProfile.jobTitle,
          appliedDate: selectedProfile.appliedDate,
          appliedTime: selectedProfile.appliedTime,
          status: selectedProfile.status,
          note: selectedProfile.note
        } : null}
      />
    </div>
  );
};
