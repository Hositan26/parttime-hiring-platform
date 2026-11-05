import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Calendar, Clock, Edit2, X, Save, Camera, Trash2, AlertCircle, CheckCircle2, Users, Briefcase } from 'lucide-react';
import { getStoreDetail, updateStore, updateStoreCover, getStoreEmployees, type EmployerStoreDetailDTO, type EmployeeResponseDTO } from '../../../services/storeApi';
import styles from './StoreDetail.module.css';

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployerStoreDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '', description: '' });

  const [activeTab, setActiveTab] = useState<'JOBS' | 'EMPLOYEES'>('JOBS');
  const [employees, setEmployees] = useState<EmployeeResponseDTO[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const changeCover = async (file?: File) => {
    if (!id || coverBusy) return;
    setCoverError('');
    setFeedbackMsg('');
    if (file && (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setCoverError('Vui lòng chọn ảnh JPEG hoặc PNG tối đa 5 MB.');
      return;
    }
    setCoverBusy(true);
    try {
      const coverImageUrl = await updateStoreCover(id, file);
      setData(current => current ? { ...current, coverImageUrl } : current);
      setFeedbackMsg(file ? 'Cập nhật ảnh đại diện cửa hàng thành công!' : 'Đã gỡ ảnh đại diện cửa hàng.');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (failure) {
      setCoverError(failure instanceof Error ? failure.message : 'Không thể cập nhật ảnh.');
    } finally {
      setCoverBusy(false);
    }
  };

  const fetchDetail = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const result = await getStoreDetail(id);
      setData(result);
      setEditData({
        name: result.name || '',
        phone: result.phone || '',
        address: result.streetAddress || '',
        description: result.description || ''
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!id) return;
      try {
        setLoadingEmployees(true);
        const result = await getStoreEmployees(id);
        setEmployees(result);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (activeTab === 'EMPLOYEES' && employees.length === 0) {
      fetchEmployees();
    }
  }, [activeTab, id]);

  const filteredEmployees = employees.filter(emp => {
    if (employeeFilter === 'ALL') return true;
    return emp.status === employeeFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'HIRED': return styles.statusUpcoming;
      case 'WORKING': return styles.statusWorking;
      case 'QUIT': return styles.statusQuit;
      case 'TERMINATED': return styles.statusTerminated;
      case 'COMPLETED': return styles.statusCompleted;
      default: return styles.statusDefault;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'HIRED': return 'Chuẩn bị đi làm';
      case 'WORKING': return 'Đang làm việc';
      case 'QUIT': return 'Đã nghỉ việc';
      case 'TERMINATED': return 'Bị sa thải';
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const renderWorkDates = (emp: EmployeeResponseDTO) => {
    const startDateStr = emp.startDate ? new Date(emp.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
    
    if (['COMPLETED', 'QUIT', 'TERMINATED'].includes(emp.status)) {
      const endDateStr = emp.endDate ? new Date(emp.endDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
      return `Từ ${startDateStr} đến ${endDateStr}`;
    }
    
    return `Từ ${startDateStr}`;
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await updateStore(id, editData);
      setIsEditing(false);
      setFeedbackMsg('Đã lưu thông tin cửa hàng thành công!');
      setTimeout(() => setFeedbackMsg(''), 3000);
      fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (data) {
      setEditData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.streetAddress || '',
        description: data.description || ''
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
        <p>Đang tải thông tin cửa hàng...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '440px', margin: '0 auto' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
        <h3>{error || 'Cửa hàng không tồn tại'}</h3>
        <button onClick={() => navigate('/employer/stores')} className="btn-primary" style={{ marginTop: '16px' }}>
          Quay lại danh sách cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className={styles.storeDetailPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/employer/stores')} aria-label="Quay lại">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>{data.name}</h1>
            <p className={styles.subtitle}>Mã cơ sở: ST{data.storeId.toString().padStart(3, '0')}</p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="status">
          <CheckCircle2 size={16} color="var(--success)" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {coverError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="alert">
          <AlertCircle size={16} />
          <span>{coverError}</span>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* Cột trái: Thông tin cửa hàng */}
        <div className={styles.storeInfoCard}>
          <div className={styles.cardHeaderWithAction}>
            <div className={styles.storeLogoHeader}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={data.coverImageUrl || data.logo || "https://cdn-icons-png.flaticon.com/512/3268/3268832.png"} 
                  alt="Ảnh đại diện cửa hàng" 
                  className={styles.storeLogo} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png";
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h2 className={styles.storeName} style={{ margin: 0 }}>{data.name}</h2>
                  <span className={`${styles.statusBadge} ${data.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                    {data.status === 'ACTIVE' ? 'Đang hoạt động' : data.status === 'PAUSED' ? 'Tạm ngừng' : 'Chờ phê duyệt'}
                  </span>
                </div>
                
                {/* Image upload & delete controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <label 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--bg-lighter)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-gray)',
                      cursor: coverBusy ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Camera size={13} color="var(--primary)" />
                    <span>{coverBusy ? 'Đang xử lý...' : 'Đổi ảnh'}</span>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png" 
                      disabled={coverBusy} 
                      style={{ display: 'none' }}
                      onChange={event => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = '';
                        if (file) void changeCover(file);
                      }} 
                    />
                  </label>
                  {data.coverImageUrl && (
                    <button 
                      type="button" 
                      disabled={coverBusy} 
                      onClick={() => void changeCover()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #FECACA',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--danger)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} /> Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <Edit2 size={15} /> Chỉnh sửa
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                  <X size={15} /> Hủy
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Save size={15} /> Lưu</>}
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Thông tin liên hệ & Địa chỉ</h3>
            <div className={styles.detailListBox}>
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>
                  <Phone size={15} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--text-light)' }}/>
                  Số điện thoại
                </span>
                {isEditing ? (
                  <input 
                    type="text" 
                    className={styles.editInput} 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    placeholder="Số điện thoại liên hệ"
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{data.phone || 'Chưa cập nhật'}</span>
                )}
              </div>
              
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>
                  <MapPin size={15} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary)' }}/>
                  Địa chỉ đường
                </span>
                {isEditing ? (
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      className={styles.editInput} 
                      value={editData.address} 
                      onChange={e => setEditData({...editData, address: e.target.value})}
                      placeholder="Số nhà, tên đường..."
                    />
                    <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#D97706', lineHeight: '1.4' }}>
                      ⚠️ Lưu ý: Thay đổi địa chỉ đường sẽ yêu cầu quản trị viên phê duyệt lại trước khi cửa hàng tiếp tục hiển thị hoạt động.
                    </p>
                  </div>
                ) : (
                  <span className={styles.detailBoxValue}>{data.address}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Mô tả cơ sở</h3>
            {isEditing ? (
              <textarea 
                className={styles.editTextarea} 
                value={editData.description} 
                onChange={e => setEditData({...editData, description: e.target.value})}
                placeholder="Mô tả không gian làm việc, tiện ích tại cửa hàng..."
                rows={4}
              />
            ) : (
              <p className={styles.descriptionText}>
                {data.description || 'Chưa có mô tả chi tiết cho cơ sở này.'}
              </p>
            )}
          </div>
        </div>

        {/* Cột phải: Tabs & Nội dung */}
        <div className={styles.rightColumn}>
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'JOBS' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('JOBS')}
            >
              <Briefcase size={16} /> Tin tuyển dụng ({data.jobs.length})
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'EMPLOYEES' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('EMPLOYEES')}
            >
              <Users size={16} /> Nhân sự cửa hàng
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'JOBS' && (
              <div className={styles.jobsCard}>
                <div className={styles.jobsList}>
                  {data.jobs.length === 0 ? (
                    <div className={styles.noJobs}>Chưa có tin tuyển dụng nào được gán cho cửa hàng này.</div>
                  ) : (
                    data.jobs.map(job => (
                      <div key={job.jobId} className={styles.jobItem}>
                        <div className={styles.jobInfo}>
                          <h4 className={styles.jobTitle}>{job.title}</h4>
                          <div className={styles.jobMeta}>
                            <span className={styles.metaItem}><Calendar size={13} /> Tạo ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className={styles.metaItem}><Clock size={13} /> Hạn nộp: {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString('vi-VN') : 'Không thời hạn'}</span>
                          </div>
                        </div>
                        <div className={styles.jobStats}>
                          <div className={styles.statBox}>
                            <span className={styles.statBoxLabel}>Đơn nộp</span>
                            <span className={styles.statBoxValue}>{job.applications}</span>
                          </div>
                          <span className={`${styles.jobStatus} ${job.status === 'ACTIVE' ? styles.statusACTIVE : job.status === 'PAUSED' ? styles.statusPAUSED : styles.statusCLOSED}`}>
                            {job.status === 'ACTIVE' ? 'Đang tuyển' : job.status === 'PAUSED' ? 'Tạm ngưng' : 'Đã đóng'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'EMPLOYEES' && (
              <div className={styles.employeesCard}>
                <div className={styles.filterPillsWrapper}>
                  <div className={styles.filterPills}>
                    <button className={`${styles.filterPill} ${employeeFilter === 'ALL' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('ALL')}>Tất cả</button>
                    <button className={`${styles.filterPill} ${employeeFilter === 'HIRED' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('HIRED')}>Chuẩn bị đi làm</button>
                    <button className={`${styles.filterPill} ${employeeFilter === 'WORKING' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('WORKING')}>Đang làm việc</button>
                    <button className={`${styles.filterPill} ${employeeFilter === 'COMPLETED' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('COMPLETED')}>Đã hoàn thành</button>
                    <button className={`${styles.filterPill} ${employeeFilter === 'QUIT' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('QUIT')}>Đã nghỉ việc</button>
                    <button className={`${styles.filterPill} ${employeeFilter === 'TERMINATED' ? styles.activePill : ''}`} onClick={() => setEmployeeFilter('TERMINATED')}>Bị sa thải</button>
                  </div>
                </div>
                
                {loadingEmployees ? (
                  <div className={styles.loading}>Đang tải danh sách nhân sự...</div>
                ) : (
                  <div className={styles.employeeList}>
                    {filteredEmployees.length === 0 ? (
                      <div className={styles.noJobs}>Không có nhân sự nào khớp với bộ lọc.</div>
                    ) : (
                      filteredEmployees.map(emp => (
                        <div key={emp.employmentId} className={styles.employeeItem}>
                          <div className={styles.employeeHeader}>
                            <div className={styles.employeeAvatarBox}>
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt={emp.displayName} className={styles.employeeAvatar} />
                              ) : (
                                <div className={styles.employeeAvatarFallback}>{emp.displayName.charAt(0)}</div>
                              )}
                              <div className={styles.employeeInfo}>
                                <h4 className={styles.employeeName}>{emp.displayName}</h4>
                                <p className={styles.employeeJob}>{emp.jobTitle || 'Nhân viên'} • {renderWorkDates(emp)}</p>
                              </div>
                            </div>
                            <div className={styles.employeeActions}>
                              <span className={`${styles.empStatusBadge} ${getStatusBadgeClass(emp.status)}`}>
                                {getStatusText(emp.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
