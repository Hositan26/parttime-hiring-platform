import React, { useState, useEffect } from 'react';
import { Store, Briefcase, Users, Star, CheckCircle2, Edit3, Calendar, FileDigit, Eye, Save, X, Building, Mail, Phone, Globe, ShieldCheck } from 'lucide-react';
import styles from './Profile.module.css';
import { getEmployerProfile, updateEmployerProfile } from '../../../services/employerProfile.service';
import type { EmployerProfileResponse, EmployerProfileUpdateRequest } from '../../../services/employerProfile.service';
import { getDashboardOverview } from '../../../services/dashboardApi';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<EmployerProfileResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EmployerProfileUpdateRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        getEmployerProfile(),
        getDashboardOverview()
      ]);
      setProfile(profileData);
      setStats(statsData);
      setEditForm({
        businessType: profileData.businessType || '',
        emailContact: profileData.emailContact || '',
        phoneContact: profileData.phoneContact || '',
        description: profileData.description || '',
        website: profileData.website || '',
        representativeName: profileData.representativeName || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateEmployerProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        businessType: profile.businessType || '',
        emailContact: profile.emailContact || '',
        phoneContact: profile.phoneContact || '',
        description: profile.description || '',
        website: profile.website || '',
        representativeName: profile.representativeName || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <div style={{ color: 'var(--text-gray)' }}>Đang tải dữ liệu hồ sơ...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <div style={{ color: 'var(--danger)' }}>Không thể tải hồ sơ. Vui lòng thử lại sau.</div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.profilePage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hồ sơ Doanh nghiệp</h1>
          <p className={styles.subtitle}>Quản lý thông tin công ty, thương hiệu tuyển dụng và tài liệu xác minh.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <motion.div className={styles.statCard} whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Store size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng cửa hàng</div>
            <div className={styles.statValue}>{stats?.totalStores || 0}</div>
          </div>
        </motion.div>
        
        <motion.div className={styles.statCard} whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng tin tuyển dụng</div>
            <div className={styles.statValue}>{stats?.totalJobs || 0}</div>
          </div>
        </motion.div>
        
        <motion.div className={styles.statCard} whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng ứng viên</div>
            <div className={styles.statValue}>{stats?.totalApplications || 0}</div>
            <div className={styles.statSub} style={{color: '#D97706'}}>Chờ xử lý: {stats?.pendingApplications || 0}</div>
          </div>
        </motion.div>
        
        <motion.div className={styles.statCard} whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }} style={{ borderColor: profile.status === 'ACTIVE' ? 'var(--success)' : 'var(--warning)', background: profile.status === 'ACTIVE' ? 'linear-gradient(to right, white, #f0fdf4)' : 'linear-gradient(to right, white, #fffbeb)' }}>
          <div className={styles.statIcon} style={{ backgroundColor: profile.status === 'ACTIVE' ? '#DCFCE7' : '#FEF3C7', color: profile.status === 'ACTIVE' ? '#059669' : '#D97706' }}>
            {profile.status === 'ACTIVE' ? <ShieldCheck size={24} /> : <Star size={24} />}
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Trạng thái xác minh</div>
            <div className={styles.statValue} style={{ fontSize: '1.2rem', color: profile.status === 'ACTIVE' ? '#059669' : '#D97706' }}>
              {profile.status === 'ACTIVE' ? 'Đã xác minh' : (profile.status === 'SUSPENDED' ? 'Bị từ chối/Khóa' : 'Chờ duyệt')}
            </div>
          </div>
        </motion.div>
      </div>

      <div className={styles.profileBanner}>
        <div className={styles.bannerLeft}>
          <div style={{ position: 'relative' }}>
            <img src={profile.storeFrontImageUrl || "https://cdn-icons-png.flaticon.com/512/3268/3268832.png"} alt="Company Logo" className={styles.companyLogo} style={{ objectFit: 'cover' }} />
            {profile.status === 'APPROVED' && (
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--success)', color: 'white', borderRadius: '50%', padding: '4px', border: '2px solid white' }}>
                <CheckCircle2 size={16} />
              </div>
            )}
          </div>
          <div className={styles.companyInfo}>
            <div className={styles.companyNameRow} style={{ alignItems: 'center' }}>
              <h2 className={styles.companyName} style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{profile.companyName}</h2>
              {profile.status === 'ACTIVE' && (
                <div className={styles.verifiedBadge} style={{ background: '#DCFCE7', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Verified
                </div>
              )}
            </div>
            <div className={styles.companyMeta} style={{ marginTop: '8px' }}>
              {profile.createdAt && (
                <div className={styles.metaItem} style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                  <Calendar size={14} /> Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                </div>
              )}
              <div className={styles.metaItem} style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                <FileDigit size={14} /> ID: EMP{String(profile.employerId).padStart(4, '0')}
              </div>
            </div>
          </div>
        </div>
        <div>
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.button 
                key="edit-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={styles.btnOutline}
                onClick={() => setIsEditing(true)}
                style={{ background: 'white' }}
              >
                <Edit3 size={16} /> Chỉnh sửa hồ sơ
              </motion.button>
            ) : (
              <motion.div 
                key="save-btns"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <button className={styles.btnOutline} onClick={handleCancel} style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'white' }}>
                  <X size={16} /> Hủy
                </button>
                <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu thay đổi</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <motion.div className={styles.card} style={{ flex: 1.5 }}>
          <div className={styles.cardTitle} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>Thông tin liên hệ & Cơ bản</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}><Building size={14}/> Tên công ty</label>
              <input type="text" className={styles.input} value={profile.companyName} readOnly style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-gray)' } : {}} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><FileDigit size={14}/> Mã số thuế</label>
              <input type="text" className={styles.input} value={profile.taxCode || ''} readOnly style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-gray)' } : {}} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Mail size={14}/> Email liên hệ</label>
              <input type="email" name="emailContact" className={styles.input} value={isEditing ? editForm.emailContact : profile.emailContact || ''} onChange={handleInputChange} readOnly={!isEditing} style={!isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {}} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Phone size={14}/> Số điện thoại liên hệ</label>
              <input type="tel" name="phoneContact" className={styles.input} value={isEditing ? editForm.phoneContact : profile.phoneContact || ''} onChange={handleInputChange} readOnly={!isEditing} style={!isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {}} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Users size={14}/> Tên người đại diện</label>
              <input type="text" name="representativeName" className={styles.input} value={isEditing ? editForm.representativeName : profile.representativeName || ''} onChange={handleInputChange} readOnly={!isEditing} style={!isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {}} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Globe size={14}/> Website / Fanpage</label>
              <input type="url" name="website" className={styles.input} value={isEditing ? editForm.website : profile.website || ''} onChange={handleInputChange} readOnly={!isEditing} style={!isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {}} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}><Briefcase size={14}/> Ngành nghề / Lĩnh vực hoạt động</label>
              <input type="text" name="businessType" className={styles.input} value={isEditing ? editForm.businessType : profile.businessType || ''} onChange={handleInputChange} readOnly={!isEditing} style={!isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {}} />
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          <motion.div className={styles.card}>
            <div className={styles.cardTitle} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>Giới thiệu công ty</div>
            <div className={styles.formGroup}>
              <textarea 
                name="description" 
                className={styles.textarea} style={{ height: 'auto', minHeight: '160px', resize: 'vertical', ...( !isEditing ? { backgroundColor: '#f8fafc', borderColor: 'transparent' } : {} ) }}
                readOnly={!isEditing} 
                value={isEditing ? editForm.description : profile.description || ''} 
                onChange={handleInputChange}
                placeholder="Viết một vài dòng giới thiệu về môi trường làm việc, văn hóa doanh nghiệp..."
              />
            </div>
          </motion.div>

          <motion.div className={styles.card} style={{ flex: 1 }}>
            <div className={styles.cardTitle} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>Tài liệu xác minh</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '20px', lineHeight: '1.5' }}>
              Hồ sơ này dùng để xác minh tính hợp pháp của doanh nghiệp. Để cập nhật giấy tờ, vui lòng liên hệ bộ phận hỗ trợ.
            </p>
            <div className={styles.docsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { name: 'CCCD mặt trước', img: profile.idCardFrontUrl },
                { name: 'CCCD mặt sau', img: profile.idCardBackUrl },
                { name: 'Giấy phép kinh doanh', img: profile.businessLicenseUrl },
                { name: 'Ảnh mặt tiền', img: profile.storeFrontImageUrl },
              ].filter(doc => doc.img).map((doc, idx) => (
                <div key={idx} className={styles.docItem} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                  <div className={styles.docPreview} style={{ height: '100px', position: 'relative', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={doc.img} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <a href={doc.img} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.5)', opacity: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontWeight: 600, gap: '6px' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                      <Eye size={18} /> Xem ảnh
                    </a>
                  </div>
                  <div style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                    {doc.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
