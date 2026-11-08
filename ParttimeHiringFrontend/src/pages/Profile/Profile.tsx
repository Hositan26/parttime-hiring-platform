import { hasAnyRole } from '../../services/authPolicy';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { User, Calendar, Briefcase, Search, Mail, Edit2, Save, X, Camera, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './Profile.module.css';
import { getMe, updateMe } from '../../services/auth.service';
import { apiBase, apiFetch } from '../../services/apiClient';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    userId: number; displayName: string; username: string; email?: string; dateOfBirth?: string;
    avatarUrl?: string; roles: string[]; hasPassword: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ 
    displayName: '', 
    username: '',
    email: '',
    dateOfBirth: '',
    currentPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'));
  
  const validationError = !editData.displayName.trim() || editData.displayName.length > 100
    ? 'Tên hiển thị phải có từ 1 đến 100 ký tự.'
    : !/^[a-zA-Z0-9_]{3,50}$/.test(editData.username) ? 'Tên đăng nhập gồm 3–50 chữ, số hoặc dấu gạch dưới.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email) ? 'Email không hợp lệ.'
    : editData.dateOfBirth && editData.dateOfBirth > today ? 'Ngày sinh không được ở tương lai.' : '';

  useEffect(() => {
    getMe()
      .then(data => {
        setUser(data);
        setEditData({
          displayName: data.displayName || '',
          username: data.username || '',
          email: data.email || '',
          dateOfBirth: data.dateOfBirth || '',
          currentPassword: ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (validationError) { setErrorMsg(validationError); return; }
    if (user?.hasPassword && !editData.currentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu xác nhận để lưu thay đổi.');
      return;
    }
    setErrorMsg('');
    setSaving(true);
    try {
      const updatedUser = await updateMe(editData);
      setUser(updatedUser);
      setIsEditing(false);
      setEditData({ ...editData, currentPassword: '' });
      setSuccessMsg('Đã cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Update failed', error);
      setErrorMsg(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setAvatarError('Chọn ảnh JPEG hoặc PNG tối đa 5 MB.'); 
      return;
    }
    setAvatarBusy(true); 
    setAvatarError('');
    try {
      const body = new FormData(); 
      body.append('file', file);
      const response = await apiFetch(`${apiBase}/users/me/avatar`, { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể đổi avatar.');
      setUser(data.result); 
      window.dispatchEvent(new Event('auth:changed'));
      setSuccessMsg('Đã cập nhật ảnh đại diện!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (failure) { 
      setAvatarError(failure instanceof Error ? failure.message : 'Không thể đổi avatar.'); 
    } finally { 
      setAvatarBusy(false); 
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      displayName: user?.displayName || '',
      username: user?.username || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || '',
      currentPassword: ''
    });
    setErrorMsg('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ marginBottom: '16px' }}>Bạn chưa đăng nhập.</p>
          <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.profileContainer}>
        {/* Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerTop}>
            <div className={styles.avatarWrapper}>
              {user.avatarUrl && user.avatarUrl !== 'null' ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=random`;
                  }}
                />
              ) : (
                <div className={styles.avatar}>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</div>
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.roleTag}>
                <User size={14} /> Hồ sơ cá nhân
              </div>
              <h1 className={styles.displayName} style={{ wordBreak: 'break-word' }}>
                {user.displayName || user.username}
              </h1>
              <p className={styles.username}>@{user.username || 'user'}</p>
              <p className={styles.description}>
                Quản lý thông tin tài khoản, cập nhật liên hệ và truy cập nhanh các dịch vụ tuyển dụng.
              </p>
            </div>
          </div>

          <div className={styles.infoCardsGrid}>
            <div className={styles.infoCard}>
              <User size={20} className={styles.iconBlue} />
              <div>
                <p className={styles.infoLabel}>TÊN HIỂN THỊ</p>
                <p className={styles.infoValue} style={{ wordBreak: 'break-word' }}>{user.displayName || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <Mail size={20} className={styles.iconBlue} />
              <div>
                <p className={styles.infoLabel}>EMAIL</p>
                <p className={styles.infoValue} style={{ wordBreak: 'break-word' }}>{user.email || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <Calendar size={20} className={styles.iconBlue} />
              <div>
                <p className={styles.infoLabel}>NGÀY SINH</p>
                <p className={styles.infoValue}>{user.dateOfBirth || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          <div className={styles.headerAction} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-white)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  cursor: avatarBusy ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Camera size={15} color="var(--primary)" />
                <span>{avatarBusy ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}</span>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png" 
                  disabled={avatarBusy} 
                  style={{ display: 'none' }}
                  onChange={event => {
                    void uploadAvatar(event.target.files?.[0]); 
                    event.target.value = '';
                  }} 
                />
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>(JPEG/PNG, tối đa 5 MB)</span>
            </div>

            <Button variant="primary" onClick={() => navigate('/applied-jobs')}>
              <Briefcase size={16} style={{ marginRight: '6px' }} /> 
              Xem việc đã ứng tuyển
            </Button>
          </div>

          {avatarError && <p role="alert" style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>{avatarError}</p>}
          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontSize: '0.85rem', marginTop: '8px' }} role="status">
              <CheckCircle2 size={16} color="var(--success)" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomGrid}>
          {/* Account Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderWithAction}>
              <div>
                <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>
                <p className={styles.cardDesc}>
                  Thông tin hồ sơ của bạn được bảo mật và dùng cho việc xác minh danh tính và liên hệ việc làm.
                </p>
              </div>
              {!isEditing ? (
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button className={styles.cancelBtn} onClick={handleCancelEdit} disabled={saving}>
                    <X size={16} /> Hủy
                  </button>
                  <button className={styles.saveBtn} onClick={handleSave} disabled={saving || Boolean(validationError)}>
                    {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu</>}
                  </button>
                </div>
              )}
            </div>

            {(errorMsg || validationError) && isEditing && (
              <div className={styles.warningAlert} style={{ backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{validationError || errorMsg}</span>
              </div>
            )}

            {(!user.dateOfBirth && !isEditing) && (
              <div className={styles.warningAlert}>
                Bạn chưa cập nhật ngày sinh. Nhấn "Chỉnh sửa" để hoàn thiện hồ sơ nhé!
              </div>
            )}

            <div className={styles.detailListBox}>
              {/* Display Name */}
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>Tên hiển thị</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    className={styles.editInput} 
                    value={editData.displayName} 
                    onChange={e => setEditData({...editData, displayName: e.target.value})}
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{user.displayName || 'Chưa cập nhật'}</span>
                )}
              </div>

              {/* Username */}
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>Tên đăng nhập</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    className={styles.editInput} 
                    value={editData.username} 
                    onChange={e => setEditData({...editData, username: e.target.value})}
                  />
                ) : (
                  <span className={styles.detailBoxValue}>@{user.username}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>Email</span>
                {isEditing ? (
                  <input 
                    type="email" 
                    className={styles.editInput} 
                    value={editData.email} 
                    onChange={e => setEditData({...editData, email: e.target.value})}
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{user.email || 'Chưa cập nhật'}</span>
                )}
              </div>

              {/* Date of Birth */}
              <div className={styles.detailBoxRow}>
                <span className={styles.detailBoxLabel}>Ngày sinh</span>
                {isEditing ? (
                  <input 
                    type="date" 
                    max={today}
                    className={styles.editInput} 
                    value={editData.dateOfBirth} 
                    onChange={e => setEditData({...editData, dateOfBirth: e.target.value})}
                  />
                ) : (
                  <span className={styles.detailBoxValue}>{user.dateOfBirth || 'Chưa cập nhật'}</span>
                )}
              </div>

              {/* Confirm Password (only if editing and user has password) */}
              {(isEditing && user.hasPassword) && (
                <div className={styles.detailBoxRow} style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                  <span className={styles.detailBoxLabel} style={{ color: '#d97706' }}>
                    <Lock size={14} style={{ display: 'inline', marginRight: 4 }} />
                    Mật khẩu xác nhận
                  </span>
                  <input 
                    type="password" 
                    className={styles.editInput} 
                    placeholder="Nhập mật khẩu hiện tại để xác nhận thay đổi"
                    value={editData.currentPassword} 
                    onChange={e => setEditData({...editData, currentPassword: e.target.value})}
                    style={{ borderColor: '#fcd34d' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Truy cập nhanh</h2>
            <p className={styles.cardDesc}>
              Lối tắt tiện ích để chuyển nhanh đến các chức năng chính.
            </p>
            <div className={styles.quickLinks}>
              <Link to="/change-password" className={styles.quickLink}>
                <Lock size={16} /> Đổi mật khẩu
              </Link>
              {hasAnyRole(user.roles ?? [], ['EMPLOYER']) && (
                <Link to="/employer/dashboard" className={styles.quickLink} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'rgba(0, 177, 79, 0.3)' }}>
                  <Briefcase size={16} /> Quản lý doanh nghiệp
                </Link>
              )}
              <Link to="/applied-jobs" className={styles.quickLink}>
                <Briefcase size={16} /> Việc đã ứng tuyển
              </Link>
              <Link to="/candidate-profile" className={styles.quickLink}>
                <User size={16} /> Hồ sơ & CV ứng tuyển
              </Link>
              <Link to="/jobs" className={styles.quickLink}>
                <Search size={16} /> Tìm việc làm mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
