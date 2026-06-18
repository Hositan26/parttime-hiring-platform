import React, { useState } from 'react';
import { X, FileText, Users, DollarSign, Calendar, MapPin, Clock, Briefcase, ChevronRight, User, CheckCircle2, Star } from 'lucide-react';
import styles from './JobDetailDrawer.module.css';

interface JobDetailDrawerProps {
  job: any;
  onClose: () => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({ job, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'APPLICANTS'>('DETAILS');

  return (
    <div className={styles.drawerOverlay}>
      <div className={styles.drawerContent}>
        
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerDecor}></div>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <div className={styles.logoContainer}>
                <img src={job.logo} alt="logo" className={styles.logo} />
              </div>
              <div className={styles.titleArea}>
                <div className={styles.metaTagsTop}>
                  <span className={`${styles.statusBadge} ${job.status === 'OPEN' ? styles.statusOPEN : styles.statusCLOSED}`}>
                    {job.status === 'OPEN' ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ ĐÓNG'}
                  </span>
                  <span className={styles.idText}>ID: {job.id}</span>
                </div>
                <h2>{job.title}</h2>
                <div className={styles.storeInfoRow}>
                  <MapPin size={16} />
                  <span>{job.store} - {job.address}</span>
                </div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'DETAILS' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('DETAILS')}
            >
              <FileText size={18} /> Thông tin tin tuyển dụng
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'APPLICANTS' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('APPLICANTS')}
            >
              <Users size={18} /> Danh sách ứng viên 
              <span className={styles.badgeCount}>{job.applicants}</span>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {activeTab === 'DETAILS' && (
            <div className={styles.detailsTab}>
              
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                    <Briefcase size={20} />
                  </div>
                  <span>Tổng quan công việc</span>
                </div>
                <div className={styles.overviewGrid}>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Clock size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Loại hình</span>
                      <span className={styles.overviewValue}>{job.type}</span>
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Users size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Số lượng cần tuyển</span>
                      <span className={styles.overviewValue}>05 người <span className={styles.overviewSub}>(Đã có {job.applicants} hồ sơ)</span></span>
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Calendar size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Hạn nộp hồ sơ</span>
                      <span className={styles.overviewValue}>{job.deadline} <span className={styles.overviewSubAlert}>({job.daysLeft})</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                    <DollarSign size={20} />
                  </div>
                  <span>Lương & Ca làm việc</span>
                </div>
                
                <div className={styles.salaryBox}>
                  <div className={styles.salaryLabel}>Mức lương dự kiến</div>
                  <div className={styles.salaryAmount}>{job.salary} <span className={styles.salaryCurrency}>VND / giờ</span></div>
                </div>

                <div className={styles.shiftsArea}>
                  <div className={styles.shiftLabel}>Các ca làm việc đang trống:</div>
                  <div className={styles.tagGroup}>
                    <span className={styles.tag}>Ca sáng (08:00 - 12:00)</span>
                    <span className={styles.tag}>Ca chiều (13:00 - 17:00)</span>
                    <span className={styles.tag}>{job.shift}</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
                    <FileText size={20} />
                  </div>
                  <span>Chi tiết yêu cầu</span>
                </div>
                
                <div className={styles.contentSection}>
                  <h4>Mô tả công việc</h4>
                  <ul className={styles.contentList}>
                    <li><CheckCircle2 size={16} /> Chào đón và hướng dẫn khách hàng chọn món.</li>
                    <li><CheckCircle2 size={16} /> Nhận order, tính tiền và phục vụ đồ uống tại bàn.</li>
                    <li><CheckCircle2 size={16} /> Giữ gìn vệ sinh chung khu vực làm việc và quán.</li>
                  </ul>
                </div>

                <div className={styles.contentSection}>
                  <h4>Yêu cầu ứng viên</h4>
                  <ul className={styles.contentList}>
                    <li><CheckCircle2 size={16} /> Nam/Nữ từ 18 - 25 tuổi, sinh viên các trường ĐH/CĐ.</li>
                    <li><CheckCircle2 size={16} /> Ngoại hình sáng sủa, giao tiếp tự tin, thái độ vui vẻ.</li>
                    <li><CheckCircle2 size={16} /> Không yêu cầu kinh nghiệm (sẽ được đào tạo từ đầu).</li>
                  </ul>
                </div>

                <div className={styles.contentSectionBox}>
                  <div className={styles.contentSectionBoxIcon}><Star size={20} /></div>
                  <div className={styles.contentSectionBoxBody}>
                    <h4>Quyền lợi đặc biệt</h4>
                    <p>Phụ cấp tiền gửi xe hàng tháng. Bao ăn 1 bữa chính nếu đăng ký làm ca trên 6 tiếng liên tục. Thưởng doanh thu cửa hàng nếu vượt KPI tháng.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'APPLICANTS' && (
            <div className={styles.applicantsTab}>
              <div className={styles.card}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <User size={36} />
                  </div>
                  <h3>Quản lý ứng viên đang được phát triển</h3>
                  <p>Tính năng xem chi tiết hồ sơ ứng viên và thay đổi trạng thái sẽ sớm ra mắt trong bản cập nhật kế tiếp.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
