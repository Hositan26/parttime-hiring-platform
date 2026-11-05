import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { getMyApplications, editApplication, withdrawApplication, type JobApplicationResponse } from '../../services/application.service';
import { Clock, Building2, Briefcase } from 'lucide-react';
import styles from './AppliedJobs.module.css';

export const AppliedJobs: React.FC = () => {
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const validContact = /^\+?[0-9]{9,15}$/.test(phone) && note.length <= 2000;
  const navigate = useNavigate();

  const changeApplication = async (id: number, withdraw: boolean) => {
    if (!withdraw && !validContact) return;
    if (withdraw && !window.confirm('Bạn muốn rút đơn ứng tuyển này?')) return;
    setBusy(true); setActionError('');
    try {
      if (withdraw) await withdrawApplication(id); else await editApplication(id, phone, note);
      setApplications(await getMyApplications()); setEditing(null);
    } catch (failure) { setActionError(failure instanceof Error ? failure.message : 'Không thể cập nhật đơn.'); }
    finally { setBusy(false); }
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
        return <span className={`${styles.badge} ${styles.badgePending}`}>Đang chờ duyệt</span>;
      case 'ACCEPTED':
        return <span className={`${styles.badge} ${styles.badgeAccepted}`}>Đã được nhận</span>;
      case 'REJECTED':
        return <span className={`${styles.badge} ${styles.badgeRejected}`}>Đã từ chối</span>;
      case 'WITHDRAWN':
        return <span className="badge-warning">Đã rút đơn</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgePending}`}>{status}</span>;
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
          <p>Theo dõi toàn bộ công việc bạn đã gửi đơn ứng tuyển.</p>
        </div>
        {actionError && <p role="alert">{actionError}</p>}
        
        {error ? <p role="alert">{error} <button className="btn-outline" onClick={() => window.location.reload()}>Thử lại</button></p> : loading ? (
          <div className={styles.contentCard} style={{ padding: '3rem', justifyContent: 'center' }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className={styles.contentCard} style={{ padding: '4rem 2rem', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Briefcase size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Bạn chưa nộp đơn ứng tuyển nào.</p>
            </div>
          </div>
        ) : (
          <div className={styles.jobList}>
            {applications.map(app => (
              <div 
                key={app.applicationId} 
                className={`${styles.jobCard} ${(app.jobStatus === 'EXPIRED' || app.jobStatus === 'CLOSED' || app.jobStatus === 'PAUSED') ? styles.jobCardInactive : ''}`}
                onClick={() => navigate(`/jobs/${app.jobPostId}`)}
              >
                <div className={styles.jobHeader}>
                  <div className={styles.jobInfo}>
                    <h3 className={styles.jobTitle}>
                      {app.jobTitle}
                      {(app.jobStatus === 'EXPIRED' || app.jobStatus === 'CLOSED' || app.jobStatus === 'PAUSED') && (
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
                
                <div className={styles.jobFooter}>
                  <a className="btn-outline" href={`/applications/${app.applicationId}/conversation`} onClick={event => event.stopPropagation()}>Trao đổi / Phỏng vấn</a>
                  <div className={styles.footerItem}>
                    <Clock size={16} className={styles.footerIcon} />
                    <span>Đã nộp: {formatDate(app.appliedAt)}</span>
                  </div>
                  {app.status === 'REJECTED' && app.rejectionReason && (
                    <div className={styles.footerItem}>Lý do từ chối: {app.rejectionReason}</div>
                  )}
                  {app.note && (
                    <div className={styles.footerItem}>
                      <span>Ghi chú: {app.note}</span>
                    </div>
                  )}
                </div>
                {app.status === 'PENDING' && <div onClick={event => event.stopPropagation()}>
                  <button className="btn-outline" disabled={busy} onClick={() => {
                    setEditing(app.applicationId); setPhone(app.contactPhone); setNote(app.note || '');
                  }}>Sửa đơn</button>
                  <button className="btn-outline" disabled={busy} onClick={() => changeApplication(app.applicationId, true)}>Rút đơn</button>
                  {editing === app.applicationId && <form onSubmit={event => { event.preventDefault(); changeApplication(app.applicationId, false); }}>
                    <label>Số điện thoại<input className="input-base" value={phone} maxLength={16} onChange={event => setPhone(event.target.value)} /></label>
                    <label>Ghi chú<textarea className="input-base" value={note} maxLength={2000} onChange={event => setNote(event.target.value)} /></label>
                    {!validContact && <p role="alert">Số điện thoại cần 9–15 chữ số; ghi chú tối đa 2000 ký tự.</p>}
                    <button className="btn-primary" disabled={busy || !validContact}>Lưu</button>
                    <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Hủy</button>
                  </form>}
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
