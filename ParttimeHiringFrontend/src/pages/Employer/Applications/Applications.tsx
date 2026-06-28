import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle2, XCircle, Eye, MapPin, Search, ChevronLeft, ChevronRight, CheckCircle, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Applications.module.css';
import { getEmployerApplications, updateApplicationStatus, type EmployerApplicationResponse } from '../../../services/application.service';
import { getEmployerStores } from '../../../services/storeApi';
import { ProfileModal } from '../../../components/ProfileModal/ProfileModal';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<EmployerApplicationResponse[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<EmployerApplicationResponse | null>(null);
  
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedStoreId, selectedStatus]);

  const fetchStores = async () => {
    try {
      const response = await getEmployerStores('newest');
      if (response && response.stores) {
        setStores(response.stores);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách cửa hàng:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getEmployerApplications(selectedStoreId, selectedStatus);
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (status === 'ACCEPTED') {
      const isConfirmed = window.confirm('Bạn có chắc chắn muốn duyệt ứng viên này? Hệ thống sẽ tạo hồ sơ nhân sự chính thức.');
      if (!isConfirmed) return;
    }
    try {
      await updateApplicationStatus(id, status);
      fetchApplications(); // Refresh data
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'PENDING': return styles.statusPending;
      case 'ACCEPTED': return styles.statusAccepted;
      case 'REJECTED': return styles.statusRejected;
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'CHỜ XỬ LÝ';
      case 'ACCEPTED': return 'ĐÃ CHẤP NHẬN';
      case 'REJECTED': return 'ĐÃ TỪ CHỐI';
      default: return status;
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
          <p className={styles.subtitle}>Theo dõi và xử lý hồ sơ ứng viên gửi đến.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng đơn ứng tuyển</div>
            <div className={styles.statValue}>{totalCount}</div>
            <div className={styles.statSub}>Tất cả đơn</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Chờ xử lý</div>
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
            <input type="text" placeholder="Tìm kiếm ứng viên, job, store..." />
          </div>
          <div className={styles.filtersGroup}>
            <select 
              className={styles.select} 
              value={selectedStoreId} 
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            >
              <option value={0}>Tất cả store</option>
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
              <th>HỒ SƠ</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Đang tải...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Chưa có đơn ứng tuyển nào.</td></tr>
            ) : applications.map((app) => (
              <tr key={app.applicationId}>
                <td>
                  <div className={styles.candidateInfo}>
                    <img src={app.applicantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName)}`} alt="avatar" className={styles.avatar} />
                    <div>
                      <div className={styles.candidateName}>{app.applicantName}</div>
                      <div className={styles.candidateContact}>
                        <span>{app.applicantEmail}</span>
                        <span>{app.applicantPhone}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.jobStoreInfo}>
                    <div className={styles.jobTitle}>{app.jobTitle}</div>
                    <div className={styles.storeInfoText}>
                      <div style={{fontWeight: 500, color: 'var(--text-dark)'}}>{app.storeName}</div>
                      <div className={styles.storeInfo}>
                        <MapPin size={12} /> {app.storeAddress}
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
                  <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </td>
                <td>
                  <button className={styles.viewProfileBtn} onClick={() => setSelectedProfile(app)}>
                    <Eye size={16} /> Xem
                  </button>
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <div className={styles.actionGroup}>
                      {app.status === 'PENDING' && (
                        <>
                          <button 
                            className={styles.btnApprove} 
                            onClick={() => handleUpdateStatus(app.applicationId, 'ACCEPTED')}
                          >
                            <CheckCircle size={16} /> Duyệt
                          </button>
                          <button 
                            className={styles.btnReject} 
                            onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                          >
                            <X size={16} /> Từ chối
                          </button>
                        </>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <>
                          <button 
                            className={styles.btnApprove} 
                            style={{backgroundColor: '#e0e7ff', color: '#4f46e5'}}
                            onClick={() => navigate('/employer/employees')}
                            title="Quản lý tại trang Nhân sự"
                          >
                            <ExternalLink size={16} /> Hồ sơ NS
                          </button>
                          <button 
                            className={styles.btnReject} 
                            onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                            title="Hoàn tác thành Từ chối"
                          >
                            <X size={16} /> Từ chối
                          </button>
                        </>
                      )}
                      {app.status === 'REJECTED' && (
                        <button 
                          className={styles.btnApprove} 
                          onClick={() => handleUpdateStatus(app.applicationId, 'ACCEPTED')}
                          title="Đổi thành Duyệt"
                        >
                          <CheckCircle size={16} /> Duyệt
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length > 10 && (
          <div className={styles.pagination}>
            <div>Hiển thị 1 - {Math.min(10, applications.length)} trong số {applications.length} đơn ứng tuyển</div>
            <div className={styles.pageControls}>
              <select className={styles.select} style={{marginRight: '8px', padding: '6px 10px'}}>
                <option>10 / trang</option>
              </select>
              <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Profile Modal */}
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
