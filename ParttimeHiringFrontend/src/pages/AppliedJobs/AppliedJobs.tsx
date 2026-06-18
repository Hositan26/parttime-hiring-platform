import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { getMyApplications, type JobApplicationResponse } from '../../services/application.service';
import { Clock, MapPin, Building2, Briefcase } from 'lucide-react';
import styles from './AppliedJobs.module.css';

export const AppliedJobs: React.FC = () => {
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(data => {
        setApplications(data);
      })
      .catch(err => {
        console.error(err);
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
        
        {loading ? (
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
              <div key={app.applicationId} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div className={styles.jobInfo}>
                    <h3 className={styles.jobTitle}>{app.jobTitle}</h3>
                    <div className={styles.companyInfo}>
                      <Building2 size={16} /> <span>{app.companyName}</span>
                    </div>
                  </div>
                  <div className={styles.statusWrapper}>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
                
                <div className={styles.jobFooter}>
                  <div className={styles.footerItem}>
                    <Clock size={16} className={styles.footerIcon} />
                    <span>Đã nộp: {formatDate(app.appliedAt)}</span>
                  </div>
                  {app.note && (
                    <div className={styles.footerItem}>
                      <span>Ghi chú: {app.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
