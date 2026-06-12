import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { User, Calendar, Briefcase, Search, Mail, Edit2, Save, X } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './Profile.module.css';
import { getMe, updateMe } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const fetchUser = () => {
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
  };

  const handleSave = async () => {
    if (user.hasPassword && !editData.currentPassword) {
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
    } catch (error: any) {
      console.error('Update failed', error);
      setErrorMsg(error.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      displayName: user.displayName || '',
      username: user.username || '',
      email: user.email || '',
      dateOfBirth: user.dateOfBirth || '',
      currentPassword: ''
    });
    setErrorMsg('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải thông tin...</div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Bạn chưa đăng nhập. Vui lòng <a href="/login" style={{ color: '#10b981' }}>đăng nhập</a>.
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
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
              ) : (
                <div className={styles.avatar}>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</div>
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.roleTag}>
                <User size={14} /> Hồ sơ cá nhân
              </div>
              <h1 className={styles.displayName}>{user.displayName || user.username}</h1>
              <p className={styles.username}>@{user.username || 'user'}</p>
              <p className={styles.description}>
                Quản lý thông tin cơ bản của tài khoản và truy cập nhanh đến các chức năng phù hợp với vai trò hiện tại.
              </p>
            </div>
          </div>

          <div className={styles.infoCardsGrid}>
            <div className={styles.infoCard}>
              <User size={20} className={styles.iconBlue} />
              <div>
                <p className={styles.infoLabel}>TÊN HIỂN THỊ</p>
                <p className={styles.infoValue}>{user.displayName || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <Mail size={20} className={styles.iconBlue} />
              <div>
                <p className={styles.infoLabel}>EMAIL</p>
                <p className={styles.infoValue}>{user.email || 'Chưa cập nhật'}</p>
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

          <div className={styles.headerAction}>
            <Button variant="primary">
              <Briefcase size={16} style={{ marginRight: '8px' }} /> 
              Xem việc đã ứng tuyển
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomGrid}>
          {/* Account Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderWithAction}>
              <div>
                <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>
                <p className={styles.cardDesc}>
                  Đây là phần thông tin cơ bản đang được hiển thị trên hệ thống. Bạn có thể dùng trang này để kiểm tra nhanh tên người dùng, tên hiển thị và ngày sinh của mình.
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
                  <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu</>}
                  </button>
                </div>
              )}
            </div>

            {errorMsg && isEditing && (
              <div className={styles.warningAlert} style={{ backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' }}>
                {errorMsg}
              </div>
            )}

            {(!user.dateOfBirth && !isEditing) && (
              <div className={styles.warningAlert}>
                Bạn chưa cập nhật thông tin ngày sinh. Hãy nhấn nút "Chỉnh sửa" để bổ sung nhé!
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
                <span className={styles.detailBoxLabel}>Username</span>
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
                  <span className={styles.detailBoxLabel} style={{ color: '#d97706' }}>Xác nhận Mật khẩu</span>
                  <input 
                    type="password" 
                    className={styles.editInput} 
                    placeholder="Nhập mật khẩu hiện tại"
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
              Chọn lối tắt phù hợp để tiếp tục thao tác nhanh trong hệ thống.
            </p>
            <div className={styles.quickLinks}>
              <a href="/applied-jobs" className={styles.quickLink}>
                <Briefcase size={18} /> Việc đã ứng tuyển
              </a>
              <a href="/jobs" className={styles.quickLink}>
                <Search size={18} /> Tìm việc mới
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
