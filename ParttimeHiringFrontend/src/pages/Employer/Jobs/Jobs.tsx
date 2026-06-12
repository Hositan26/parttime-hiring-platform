import React from 'react';
import { Filter, Plus, Briefcase, PlayCircle, PauseCircle, StopCircle, Search, Eye, MoreVertical, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Jobs.module.css';

const dummyJobs = [
  { id: 'JB0001', title: 'Nhân viên thu ngân', store: 'Obt - Milktea & Coffee', address: 'Cao Thắng, Hải Châu, Đà Nẵng', logo: 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png', posted: '02/06/2025', salary: '6 - 8 triệu', type: 'PART-TIME', shift: 'Ca chiều', applicants: 12, deadline: '15/06/2025', daysLeft: 'Còn 5 ngày', status: 'ACTIVE' },
  { id: 'JB0002', title: 'Nhân viên pha chế', store: 'Obt - Milktea & Coffee', address: 'Cao Thắng, Hải Châu, Đà Nẵng', logo: 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png', posted: '01/06/2025', salary: '7 - 10 triệu', type: 'PART-TIME', shift: 'Ca tối', applicants: 8, deadline: '20/06/2025', daysLeft: 'Còn 10 ngày', status: 'ACTIVE' },
  { id: 'JB0003', title: 'Nhân viên bán hàng', store: 'Sport1 Lottemart Đà Nẵng', address: 'Lotte Mart, Hải Châu, Đà Nẵng', logo: 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png', posted: '25/05/2025', salary: '5 - 7 triệu', type: 'PART-TIME', shift: 'Ca linh hoạt', applicants: 5, deadline: '10/06/2025', daysLeft: 'Còn 0 ngày', status: 'PAUSED' },
  { id: 'JB0004', title: 'Phụ bếp', store: 'MixFood', address: 'Nguyễn Duy Hiệu, Sơn Trà, Đà Nẵng', logo: 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png', posted: '20/05/2025', salary: '6 - 9 triệu', type: 'PART-TIME', shift: 'Ca sáng', applicants: 9, deadline: '05/06/2025', daysLeft: 'Đã hết hạn', status: 'CLOSED' },
  { id: 'JB0005', title: 'Nhân viên phục vụ', store: 'Nhà hàng Cơm Niêu Má Hai', address: 'Hòa Cường Nam, Hải Châu, Đà Nẵng', logo: 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png', posted: '18/05/2025', salary: '6 - 8 triệu', type: 'PART-TIME', shift: 'Ca tối', applicants: 7, deadline: '12/06/2025', daysLeft: 'Còn 2 ngày', status: 'ACTIVE' },
];

export const Jobs: React.FC = () => {
  return (
    <div className={styles.jobsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tin tuyển dụng</h1>
          <p className={styles.subtitle}>Quản lý các tin tuyển dụng đang đăng của bạn.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnOutline}>
            <Filter size={18} /> Bộ lọc
          </button>
          <button className={styles.btnPrimary}>
            <Plus size={18} /> Tạo job mới
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng số job</div>
            <div className={styles.statValue}>13</div>
            <div className={styles.statSub}>Tất cả tin tuyển dụng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <PlayCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đang hoạt động</div>
            <div className={styles.statValue}>11</div>
            <div className={styles.statSub}>84.6% tổng số job</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <PauseCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tạm dừng</div>
            <div className={styles.statValue}>1</div>
            <div className={styles.statSub}>7.7% tổng số job</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
            <StopCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã đóng</div>
            <div className={styles.statValue}>1</div>
            <div className={styles.statSub}>7.7% tổng số job</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Tìm kiếm job theo tiêu đề..." />
          </div>
          <div className={styles.filtersGroup}>
            <select className={styles.select}>
              <option>Tất cả store</option>
            </select>
            <select className={styles.select}>
              <option>Tất cả trạng thái</option>
            </select>
            <select className={styles.select}>
              <option>Sắp xếp: Mới nhất</option>
            </select>
          </div>
        </div>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>JOB</th>
              <th>STORE</th>
              <th>LƯƠNG</th>
              <th>LOẠI VIỆC</th>
              <th style={{textAlign: 'center'}}>ỨNG TUYỂN</th>
              <th>HẠN NỘP</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {dummyJobs.map((job, idx) => (
              <tr key={idx}>
                <td>
                  <div className={styles.jobInfo}>
                    <img src={job.logo} alt="logo" className={styles.jobLogo} />
                    <div>
                      <div className={styles.jobTitle}>{job.title}</div>
                      <div className={styles.jobId}>ID: {job.id} • Đăng: {job.posted}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.storeInfoText}>
                    <div className={styles.storeName}>{job.store}</div>
                    <div className={styles.storeAddress}>
                      <MapPin size={12} /> {job.address}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.salaryText}>{job.salary}</div>
                </td>
                <td>
                  <div className={styles.tagsWrapper}>
                    <span className={`${styles.tag} ${styles.tagType}`}>{job.type}</span>
                    <span className={`${styles.tag} ${styles.tagShift}`}>{job.shift}</span>
                  </div>
                </td>
                <td className={styles.applicantsCol}>
                  <div className={styles.applicantsCount}>{job.applicants}</div>
                  <div className={styles.applicantsText}>ứng viên</div>
                </td>
                <td>
                  <div className={styles.deadlineCol}>
                    <div className={styles.deadlineDate}>{job.deadline}</div>
                    <div className={`${styles.deadlineLeft} ${job.daysLeft.includes('hết hạn') ? styles.leftDanger : styles.leftWarning}`}>
                      {job.daysLeft}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${job.status === 'ACTIVE' ? styles.statusActive : job.status === 'PAUSED' ? styles.statusPaused : styles.statusClosed}`}>
                    {job.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.actionBtn}>
                      <Eye size={14} /> Xem
                    </button>
                    <button className={styles.moreBtn}>
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <div>Hiển thị 1 - 5 trong số 13 job</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
