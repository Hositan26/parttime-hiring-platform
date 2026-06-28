import React from 'react';
import { X, Mail, Phone, Briefcase, Store } from 'lucide-react';
import styles from './ProfileModal.module.css';

export interface ProfileData {
  applicantName: string;
  applicantAvatar?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  jobTitle?: string;
  storeName?: string;
  appliedDate?: string;
  appliedTime?: string;
  status: string;
  note?: string;
  dateLabel?: string;
  noteLabel?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen || !profile) return null;

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'CHỜ XỬ LÝ';
      case 'ACCEPTED': return 'ĐÃ CHẤP NHẬN';
      case 'REJECTED': return 'ĐÃ TỪ CHỐI';
      case 'WORKING': return 'ĐANG LÀM VIỆC';
      case 'QUIT': return 'ĐÃ NGHỈ VIỆC';
      case 'TERMINATED': return 'BỊ SA THẢI';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACCEPTED': 
      case 'WORKING': return '#15803d';
      case 'REJECTED': 
      case 'TERMINATED': return '#dc2626';
      case 'QUIT': return '#d97706';
      default: return '#d97706';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.coverPhoto}>
          <button className={styles.closeBtnCover} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.profileHeader}>
            <img 
              src={profile.applicantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.applicantName)}&background=random`} 
              alt="avatar" 
              className={styles.profileAvatar} 
            />
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'}}>
              <h3 className={styles.profileName}>{profile.applicantName}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                {profile.jobTitle && (
                  <div className={styles.profileMeta}>
                    <Briefcase size={12} /> {profile.jobTitle}
                  </div>
                )}
                {profile.storeName && (
                  <div className={styles.storeMeta}>
                    <Store size={12} /> {profile.storeName}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}><Mail size={12} style={{display: 'inline', marginRight: 4}}/>Email</div>
              <div className={styles.infoValue}>{profile.applicantEmail || '--'}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}><Phone size={12} style={{display: 'inline', marginRight: 4}}/>Số điện thoại</div>
              <div className={styles.infoValue}>{profile.applicantPhone || '--'}</div>
            </div>
            <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.infoLabel}>{profile.dateLabel || 'Ngày nộp đơn'}</div>
              <div className={styles.infoValue} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span className={styles.dateChip}>{profile.appliedDate || '--'}</span>
                {profile.appliedTime && <span className={styles.dateChip}>{profile.appliedTime}</span>}
              </div>
            </div>
            <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.infoLabel}>Trạng thái hiện tại</div>
              <div className={styles.infoValue}>
                <span className={styles.statusBadgeModal} style={{ backgroundColor: `${getStatusColor(profile.status)}15`, color: getStatusColor(profile.status) }}>
                  {getStatusText(profile.status)}
                </span>
              </div>
            </div>
          </div>
          
          {profile.note && (
            <div className={styles.noteContainer}>
              <div className={styles.infoLabel} style={{marginBottom: 8}}>{profile.noteLabel || 'Ghi chú của ứng viên'}</div>
              <div className={styles.noteContent}>{profile.note}</div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
