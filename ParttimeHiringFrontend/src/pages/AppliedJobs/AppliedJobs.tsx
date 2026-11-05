import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { getMyApplications, editApplication, withdrawApplication, type JobApplicationResponse } from '../../services/application.service';
import { Clock, Building2, Briefcase, MessageSquare, AlertCircle, Phone, CheckCircle2, XCircle, AlertTriangle, X, Edit3, ArrowRight } from 'lucide-react';
import styles from './AppliedJobs.module.css';

export const AppliedJobs: React.FC = () => {
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingApp, setEditingApp] = useState<JobApplicationResponse | null>(null);
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const validContact = /^\+?[0-9]{9,15}$/.test(phone) && note.length <= 2000;
  const navigate = useNavigate();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !validContact) return;
    setBusy(true); 
    setActionError('');
    try {
      await editApplication(editingApp.applicationId, phone, note);
      setApplications(await getMyApplications());
      setEditingApp(null);
      setActionSuccess('Cập nhật thông tin đơn ứng tuyển thành công!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'Không thể cập nhật đơn.');
    } finally {
      setBusy(false);
    }
  };

  const confirmWithdraw = async () => {
    if (!withdrawingId) return;
    setBusy(true);
    setActionError('');
    try {
      await withdrawApplication(withdrawingId);
      setApplications(await getMyApplications());
      setWithdrawingId(null);
      setActionSuccess('Đã rút đơn ứng tuyển thành công. Quyền xem CV của nhà tuyển dụng đã được thu hồi.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'Không thể rút đơn.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    getMyApplications()
      .then(data => {
        setApplications(data);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Không thể tải đơn ứng tuyển.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-warning"><Clock size={12} /> Đang chờ duyệt</span>;
      case 'ACCEPTED':
        return <span className="badge-success"><CheckCircle2 size={12} /> Đã được nhận</span>;
      case 'REJECTED':
        return <span className="badge-danger"><XCircle size={12} /> Bị từ chối</span>;
      case 'WITHDRAWN':
        return <span className="badge-neutral"><AlertCircle size={12} /> Đã rút đơn</span>;
      default:
        return <span className="badge-neutral">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <h1>Công việc đã ứng tuyển</h1>
          <p>Theo dõi quá trình xét duyệt hồ sơ, xem lý do phản hồi và trao đổi trực tiếp với nhà tuyển dụng.</p>
        </div>

        {actionError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.9rem' }} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.25rem', fontSize: '0.9rem' }} role="status">
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: 'var(--success)' }} />
            <span>{actionSuccess}</span>
          </div>
        )}
        
        {error ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }} role="alert">
            <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn-outline" onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        ) : loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-gray)' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
            <p>Đang tải danh sách đơn ứng tuyển...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Bạn chưa nộp đơn ứng tuyển nào</h3>
            <p style={{ color: 'var(--text-gray)', maxWidth: '420px', margin: '0 auto 24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Tìm kiếm việc làm part-time phù hợp và gửi hồ sơ để bắt đầu kết nối với nhà tuyển dụng.
            </p>
            <Link to="/jobs" className="btn-primary">
              Tìm việc ngay <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className={styles.jobList}>
            {applications.map(app => {
              const isJobInactive = app.jobStatus === 'EXPIRED' || app.jobStatus === 'CLOSED' || app.jobStatus === 'PAUSED';
              return (
                <div 
                  key={app.applicationId} 
                  className={`${styles.jobCard} ${isJobInactive ? styles.jobCardInactive : ''}`}
                  onClick={() => navigate(`/jobs/${app.jobPostId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.jobHeader}>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>
                        {app.jobTitle}
                        {isJobInactive && (
                          <span className={styles.jobStatusBadge}>
                            {app.jobStatus === 'EXPIRED' ? 'HẾT HẠN' : app.jobStatus === 'CLOSED' ? 'ĐÃ ĐÓNG' : 'TẠM DỪNG'}
                          </span>
                        )}
                      </h3>
                      <div className={styles.companyInfo}>
                        <Building2 size={16} /> <span>{app.companyName}</span>
                      </div>
                    </div>
                    <div className={styles.statusWrapper}>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Lý do từ chối nổi bật khi bị loại */}
                  {app.status === 'REJECTED' && (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '10px', 
                        padding: '12px 16px', 
                        backgroundColor: '#FEF2F2', 
                        border: '1px solid #FECACA', 
                        borderRadius: 'var(--radius-md)', 
                        marginTop: '0.75rem',
                        marginBottom: '0.75rem'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: '#991B1B', marginBottom: '2px' }}>
                          Lý do từ chối từ nhà tuyển dụng:
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#7F1D1D', lineHeight: '1.4' }}>
                          {app.rejectionReason || 'Nhà tuyển dụng đã xem xét và chọn ứng viên khác phù hợp hơn với tiêu chí hiện tại.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Thông tin nộp đơn */}
                  <div className={styles.jobFooter} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Link 
                        to={`/applications/${app.applicationId}/conversation`}
                        className="btn-outline"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
                      >
                        <MessageSquare size={14} /> Trao đổi / Lịch phỏng vấn
                      </Link>

                      {app.status === 'PENDING' && (
                        <>
                          <button 
                            type="button"
                            className="btn-outline" 
                            disabled={busy} 
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
                            onClick={() => {
                              setEditingApp(app);
                              setPhone(app.contactPhone || '');
                              setNote(app.note || '');
                            }}
                          >
                            <Edit3 size={14} /> Sửa đơn
                          </button>
                          <button 
                            type="button"
                            className="btn-outline" 
                            disabled={busy} 
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', color: '#DC2626', borderColor: '#FECACA' }}
                            onClick={() => setWithdrawingId(app.applicationId)}
                          >
                            Rút đơn
                          </button>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-gray)', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                      <div className={styles.footerItem}>
                        <Clock size={14} className={styles.footerIcon} />
                        <span>Nộp lúc: {formatDate(app.appliedAt)}</span>
                      </div>
                      {app.contactPhone && (
                        <div className={styles.footerItem}>
                          <Phone size={14} className={styles.footerIcon} />
                          <span>SĐT: {app.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.note && (
                    <div style={{ marginTop: '0.5rem', padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                      <strong>Ghi chú gửi kèm:</strong> {app.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Chỉnh sửa đơn ứng tuyển */}
        {editingApp && (
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
            onClick={() => setEditingApp(null)}
          >
            <div 
              style={{
                backgroundColor: 'var(--bg-white)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                maxWidth: '460px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-dark)' }}>Chỉnh sửa thông tin ứng tuyển</h3>
                <button type="button" onClick={() => setEditingApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                    Số điện thoại liên hệ <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input 
                    className="input-base" 
                    value={phone} 
                    maxLength={16} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0914 768 239" 
                    required 
                  />
                  {!/^\+?[0-9]{9,15}$/.test(phone) && phone.length > 0 && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }} role="alert">
                      Số điện thoại cần 9–15 chữ số.
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                    Ghi chú bổ sung
                  </label>
                  <textarea 
                    className="input-base" 
                    value={note} 
                    maxLength={2000} 
                    rows={4}
                    onChange={e => setNote(e.target.value)} 
                    placeholder="Thông tin thêm về lịch rảnh, ca làm..."
                    style={{ resize: 'vertical' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {note.length} / 2000
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-outline" onClick={() => setEditingApp(null)} disabled={busy}>Hủy</button>
                  <button type="submit" className="btn-primary" disabled={busy || !validContact}>
                    {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận Rút đơn */}
        {withdrawingId && (
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
            onClick={() => setWithdrawingId(null)}
          >
            <div 
              style={{
                backgroundColor: 'var(--bg-white)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                maxWidth: '440px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Xác nhận rút đơn ứng tuyển?</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
                Sau khi rút đơn, nhà tuyển dụng sẽ <strong>không thể xem hồ sơ và CV</strong> của bạn nữa. Lịch sử ứng tuyển vẫn được lưu giữ trong danh sách của bạn.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn-outline" onClick={() => setWithdrawingId(null)} disabled={busy}>
                  Giữ lại đơn
                </button>
                <button type="button" className="btn-danger" onClick={confirmWithdraw} disabled={busy}>
                  {busy ? 'Đang xử lý...' : 'Xác nhận rút đơn'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
