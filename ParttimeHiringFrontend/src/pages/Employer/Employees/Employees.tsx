import { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Eye, MapPin, Search, X, UserMinus } from 'lucide-react';
import styles from './Employees.module.css';
import { getEmployments, updateEmploymentStatus, type EmployerEmploymentResponse } from '../../../services/employment.service';
import { getEmployerStores } from '../../../services/storeApi';
import { ProfileModal } from '../../../components/ProfileModal/ProfileModal';

export default function Employees() {
  const [employments, setEmployments] = useState<EmployerEmploymentResponse[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<EmployerEmploymentResponse | null>(null);
  
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingRecord, setUpdatingRecord] = useState<EmployerEmploymentResponse | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNote, setUpdateNote] = useState<string>('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchEmployments();
  }, [selectedStoreId]);

  const fetchStores = async () => {
    try {
      const data = await getEmployerStores();
      setStores(data.stores || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployments = async () => {
    try {
      setLoading(true);
      const data = await getEmployments(selectedStoreId === 0 ? undefined : selectedStoreId);
      setEmployments(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (record: EmployerEmploymentResponse, status: string) => {
    setUpdatingRecord(record);
    setUpdateStatus(status);
    setUpdateNote('');
    setIsUpdateModalOpen(true);
  };

  const submitUpdateStatus = async () => {
    if (!updatingRecord) return;
    if ((updateStatus === 'QUIT' || updateStatus === 'TERMINATED') && !updateNote.trim()) {
      alert('Vui lòng nhập lý do nghỉ việc hoặc sa thải.');
      return;
    }
    try {
      await updateEmploymentStatus(updatingRecord.recordId, updateStatus, updateNote);
      setIsUpdateModalOpen(false);
      fetchEmployments();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'WORKING': return styles.statusAccepted;
      case 'QUIT': return styles.statusPending;
      case 'TERMINATED': return styles.statusRejected;
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'WORKING': return 'ĐANG LÀM VIỆC';
      case 'QUIT': return 'ĐÃ NGHỈ VIỆC';
      case 'TERMINATED': return 'BỊ SA THẢI';
      default: return status;
    }
  };

  const filteredEmployments = employments.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.workStatus === selectedStatus;
  });

  const workingCount = employments.filter(a => a.workStatus === 'WORKING').length;
  const inactiveCount = employments.filter(a => a.workStatus === 'QUIT' || a.workStatus === 'TERMINATED').length;
  const totalCount = employments.length;

  return (
    <div className={styles.appsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Nhân sự</h1>
          <p className={styles.subtitle}>Quản lý nhân viên đang làm việc, đã nghỉ hoặc bị sa thải</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng nhân sự</div>
            <div className={styles.statValue}>{totalCount}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đang làm việc</div>
            <div className={styles.statValue}>{workingCount}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <XCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã nghỉ/Sa thải</div>
            <div className={styles.statValue}>{inactiveCount}</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Tìm kiếm nhân viên, job, store..." />
          </div>
          <div className={styles.filtersGroup}>
            <select 
              className={styles.select} 
              value={selectedStoreId} 
              onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            >
              <option value={0}>Tất cả store</option>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName}
                </option>
              ))}
            </select>
            <select 
              className={styles.select} 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="WORKING">Đang làm việc</option>
              <option value="QUIT">Đã nghỉ việc</option>
              <option value="TERMINATED">Bị sa thải</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NHÂN SỰ</th>
                <th>JOB - STORE</th>
                <th>THỜI GIAN LÀM</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredEmployments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0, border: 'none' }}>
                    <div className={styles.emptyState}>
                      <Users size={48} color="var(--text-lighter)" />
                      <h3>Chưa có dữ liệu nhân sự</h3>
                      <p>Bạn hiện chưa có nhân viên nào đang làm việc tại các cơ sở.<br/>Hãy duyệt thêm đơn ứng tuyển để bắt đầu quá trình quản lý.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployments.map(record => (
                  <tr key={record.recordId} className={styles.tableRow}>
                    <td>
                      <div className={styles.candidateInfo}>
                        <img src={record.employeeAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(record.employeeName) + '&background=random'} alt="" className={styles.avatar} />
                        <div>
                          <div className={styles.candidateName}>{record.employeeName}</div>
                          <div className={styles.candidateContact}>{record.employeePhone || record.employeeEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.jobStoreInfo}>
                        <div className={styles.jobTitle}>{record.jobTitle}</div>
                        <div className={styles.storeInfo}><MapPin size={14} color="var(--primary)"/> {record.storeName}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCol}>
                        <div className={styles.dateText}>Từ: {record.startDate}</div>
                        {record.endDate && <div className={styles.timeText}>Đến: {record.endDate}</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(record.workStatus)}`}>
                        {getStatusText(record.workStatus)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionIconBtn} ${styles.view}`} onClick={() => setSelectedProfile(record)} title="Xem chi tiết hồ sơ">
                          <Eye size={18} />
                        </button>
                        {record.workStatus === 'WORKING' && (
                          <>
                            <button className={`${styles.actionIconBtn} ${styles.warning}`} onClick={() => handleOpenUpdate(record, 'QUIT')} title="Ghi nhận nhân viên tự xin nghỉ việc">
                              <UserMinus size={18} />
                            </button>
                            <button className={`${styles.actionIconBtn} ${styles.reject}`} onClick={() => handleOpenUpdate(record, 'TERMINATED')} title="Sa thải nhân viên này">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isUpdateModalOpen && updatingRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Cập nhật trạng thái làm việc</h3>
              <button className={styles.closeBtn} onClick={() => setIsUpdateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: '20px', background: 'var(--bg-lighter)', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>Xác nhận thay đổi trạng thái của nhân sự:</p>
                <p style={{ margin: '5px 0 0', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{updatingRecord.employeeName}</p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Thao tác:</span>
                  <span className={`${styles.statusBadge} ${getStatusClass(updateStatus)}`}>
                    {updateStatus === 'QUIT' ? 'Ghi nhận nghỉ việc' : 'Sa thải nhân viên'}
                  </span>
                </div>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Lý do / Ghi chú <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea 
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '0.95rem', resize: 'vertical' }}
                  placeholder={updateStatus === 'QUIT' ? "Nhập lý do nhân viên xin nghỉ việc..." : "Nhập lý do sa thải nhân viên..."}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setIsUpdateModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  onClick={submitUpdateStatus}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile ? {
          applicantName: selectedProfile.employeeName,
          applicantAvatar: selectedProfile.employeeAvatar,
          applicantEmail: selectedProfile.employeeEmail,
          applicantPhone: selectedProfile.employeePhone,
          jobTitle: selectedProfile.jobTitle,
          storeName: selectedProfile.storeName,
          dateLabel: 'Thời gian làm việc',
          appliedDate: `Từ ngày: ${selectedProfile.startDate}`,
          appliedTime: selectedProfile.endDate ? `Đến ngày: ${selectedProfile.endDate}` : '',
          status: selectedProfile.workStatus,
          noteLabel: selectedProfile.workStatus === 'QUIT' ? 'Lý do xin nghỉ việc' : 'Lý do sa thải',
          note: selectedProfile.note
        } : null}
      />
    </div>
  );
}
