import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Calendar, Clock, Edit2, X, Save } from 'lucide-react';
import { getStoreDetail, updateStore, type EmployerStoreDetailDTO } from '../../../services/storeApi';
import styles from './StoreDetail.module.css';

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EmployerStoreDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '', description: '' });

  const fetchDetail = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const result = await getStoreDetail(id);
      setData(result);
      setEditData({
        name: result.name || '',
        phone: result.phone || '',
        address: result.address || '',
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

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await updateStore(id, editData);
      setIsEditing(false);
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
        address: data.address || '',
        description: data.description || ''
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (error || !data) {
    return (
      <div className={styles.error}>
        <p>{error || 'Cửa hàng không tồn tại'}</p>
        <button onClick={() => navigate('/employer/stores')} className={styles.btnSecondary}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className={styles.storeDetailPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/employer/stores')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>Chi tiết cửa hàng</h1>
            <p className={styles.subtitle}>ID: ST{data.storeId.toString().padStart(3, '0')}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Cột trái: Thông tin cửa hàng */}
        <div className={styles.storeInfoCard}>
          <div className={styles.cardHeaderWithAction}>
            <div className={styles.storeLogoHeader}>
              <img src={data.logo} alt="Store Logo" className={styles.storeLogo} />
              <div>
                <h2 className={styles.storeName}>{data.name}</h2>
                <span className={`${styles.statusBadge} ${data.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                  {data.status === 'ACTIVE' ? 'Đang hoạt động' : 'Chờ phê duyệt'}
                </span>
              </div>
            </div>
            
            {data.status !== 'INACTIVE' && !isEditing && (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Chỉnh sửa
              </button>
            )}
            {isEditing && (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                  <X size={16} /> Hủy
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu</>}
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
            <div className={styles.detailListBox}>
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}><Phone size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/>Số điện thoại</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    className={styles.editInput} 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    placeholder="Số điện thoại"
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{data.phone || 'Chưa cập nhật'}</span>
                )}
              </div>
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}><MapPin size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/>Địa chỉ</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    className={styles.editInput} 
                    value={editData.address} 
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    placeholder="Địa chỉ"
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{data.address}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Mô tả</h3>
            {isEditing ? (
              <textarea 
                className={styles.editTextarea} 
                value={editData.description} 
                onChange={e => setEditData({...editData, description: e.target.value})}
                placeholder="Mô tả cửa hàng..."
                rows={4}
              />
            ) : (
              <p className={styles.descriptionText}>
                {data.description || 'Chưa có mô tả cho cửa hàng này.'}
              </p>
            )}
          </div>
        </div>

        {/* Cột phải: Danh sách Jobs */}
        <div className={styles.jobsCard}>
          <div className={styles.jobsHeader}>
            <h3 className={styles.sectionTitle}>Tin tuyển dụng ({data.jobs.length})</h3>
          </div>
          
          <div className={styles.jobsList}>
            {data.jobs.length === 0 ? (
              <div className={styles.noJobs}>Chưa có tin tuyển dụng nào cho cửa hàng này.</div>
            ) : (
              data.jobs.map(job => (
                <div key={job.jobId} className={styles.jobItem}>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.title}</h4>
                    <div className={styles.jobMeta}>
                      <span className={styles.metaItem}><Calendar size={14} /> Tạo ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className={styles.metaItem}><Clock size={14} /> Hạn chót: {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}</span>
                    </div>
                  </div>
                  <div className={styles.jobStats}>
                    <div className={styles.statBox}>
                      <span className={styles.statBoxLabel}>Ứng tuyển</span>
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
      </div>
    </div>
  );
};
