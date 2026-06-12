import React from 'react';
import { Filter, Download, Users, Clock, Eye, CheckCircle2, XCircle, Search, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Applications.module.css';

const dummyApps = [
  { applicant: { name: 'Nguyễn Thị Minh Anh', email: 'minhanh@gmail.com', phone: '0905 123 456', avatar: 'https://i.pravatar.cc/150?img=5' }, job: 'Nhân viên thu ngân', store: 'Obt - Milktea & Coffee', address: 'Cao Thắng, Hải Châu, Đà Nẵng', date: '15/06/2025', time: '14:30', status: 'CHỜ XỬ LÝ', note: '--' },
  { applicant: { name: 'Trần Văn Nam', email: 'namtv1999@gmail.com', phone: '0932 456 789', avatar: 'https://i.pravatar.cc/150?img=11' }, job: 'Nhân viên pha chế', store: 'Obt - Milktea & Coffee', address: 'Cao Thắng, Hải Châu, Đà Nẵng', date: '14/06/2025', time: '09:15', status: 'ĐÃ XEM', note: 'Phù hợp với yêu cầu, đang xem xét thêm.' },
  { applicant: { name: 'Lê Thị Hương', email: 'huonglt2001@gmail.com', phone: '0778 987 654', avatar: 'https://i.pravatar.cc/150?img=9' }, job: 'Nhân viên bán hàng', store: 'Sport1 Lottemart Đà Nẵng', address: 'Lotte Mart, Hải Châu, Đà Nẵng', date: '13/06/2025', time: '16:45', status: 'ĐÃ CHẤP NHẬN', note: 'Ứng viên phù hợp. Hẹn phỏng vấn 16/06/2025.' },
  { applicant: { name: 'Phạm Quốc Huy', email: 'huyphamq@gmail.com', phone: '0899 112 233', avatar: 'https://i.pravatar.cc/150?img=12' }, job: 'Phụ bếp', store: 'MixFood', address: 'Nguyễn Duy Hiệu, Sơn Trà, Đà Nẵng', date: '12/06/2025', time: '11:20', status: 'ĐÃ TỪ CHỐI', note: 'Không phù hợp với thời gian làm việc.' },
  { applicant: { name: 'Hoàng Thị Mai', email: 'maiht99@gmail.com', phone: '0901 234 567', avatar: 'https://i.pravatar.cc/150?img=4' }, job: 'Nhân viên phục vụ', store: 'Nhà hàng Cơm Niêu Má Hai', address: 'Hòa Cường Nam, Hải Châu, Đà Nẵng', date: '11/06/2025', time: '10:05', status: 'ĐÃ XEM', note: '--' },
];

export const Applications: React.FC = () => {
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'CHỜ XỬ LÝ': return styles.statusPending;
      case 'ĐÃ XEM': return styles.statusViewed;
      case 'ĐÃ CHẤP NHẬN': return styles.statusAccepted;
      case 'ĐÃ TỪ CHỐI': return styles.statusRejected;
      default: return '';
    }
  };

  return (
    <div className={styles.appsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đơn ứng tuyển</h1>
          <p className={styles.subtitle}>Theo dõi và xử lý hồ sơ ứng viên gửi đến.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnOutline}>
            <Download size={18} /> Xuất Excel
          </button>
          <button className={styles.btnOutline}>
            <Filter size={18} /> Bộ lọc
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng đơn ứng tuyển</div>
            <div className={styles.statValue}>42</div>
            <div className={styles.statSub}>Tất cả đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Chờ xử lý</div>
            <div className={styles.statValue}>16</div>
            <div className={styles.statSub}>38.1% tổng đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Eye size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã xem</div>
            <div className={styles.statValue}>18</div>
            <div className={styles.statSub}>42.9% tổng đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã chấp nhận</div>
            <div className={styles.statValue}>6</div>
            <div className={styles.statSub}>14.3% tổng đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <XCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã từ chối</div>
            <div className={styles.statValue}>2</div>
            <div className={styles.statSub}>4.8% tổng đơn</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Tìm kiếm ứng viên, job, store..." />
          </div>
          <div className={styles.filtersGroup}>
            <select className={styles.select}>
              <option>Tất cả job</option>
            </select>
            <select className={styles.select}>
              <option>Tất cả store</option>
            </select>
            <select className={styles.select}>
              <option>Tất cả trạng thái</option>
            </select>
            <select className={styles.select}>
              <option>Tất cả thời gian</option>
            </select>
          </div>
        </div>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ỨNG VIÊN</th>
              <th>JOB - STORE</th>
              <th>NGÀY ỨNG TUYỂN</th>
              <th>TRẠNG THÁI</th>
              <th>GHI CHÚ</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {dummyApps.map((app, idx) => (
              <tr key={idx}>
                <td>
                  <div className={styles.candidateInfo}>
                    <img src={app.applicant.avatar} alt="avatar" className={styles.avatar} />
                    <div>
                      <div className={styles.candidateName}>{app.applicant.name}</div>
                      <div className={styles.candidateContact}>
                        <span>{app.applicant.email}</span>
                        <span>{app.applicant.phone}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.jobStoreInfo}>
                    <div className={styles.jobTitle}>{app.job}</div>
                    <div className={styles.storeInfoText}>
                      <div style={{fontWeight: 500, color: 'var(--text-dark)'}}>{app.store}</div>
                      <div className={styles.storeInfo}>
                        <MapPin size={12} /> {app.address}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.dateCol}>
                    <div className={styles.dateText}>{app.date}</div>
                    <div className={styles.timeText}>{app.time}</div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <div className={styles.noteText}>{app.note}</div>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.actionBtn}>
                      <Eye size={14} /> Xem hồ sơ
                    </button>
                    <button className={styles.moreBtn}>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <div>Hiển thị 1 - 5 trong số 42 đơn ứng tuyển</div>
          <div className={styles.pageControls}>
            <select className={styles.select} style={{marginRight: '8px', padding: '6px 10px'}}>
              <option>10 / trang</option>
            </select>
            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
