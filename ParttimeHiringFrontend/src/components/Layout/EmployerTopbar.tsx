import React, { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../../services/auth.service';
import { apiBase } from '../../services/apiClient';
import styles from './EmployerLayout.module.css';

interface EmployerTopbarProps {
  onToggleMobileSidebar?: () => void;
}

export const EmployerTopbar: React.FC<EmployerTopbarProps> = ({ onToggleMobileSidebar }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getMe().then(data => {
      if (active) setUser(data);
    }).catch(console.error);
    return () => { active = false; };
  }, []);

  const displayName = user?.displayName || user?.username || 'Nhà Tuyển Dụng';
  const initial = displayName.charAt(0).toUpperCase();

  const avatarSrc = user?.avatarUrl && user.avatarUrl !== 'null'
    ? (user.avatarUrl.startsWith('http')
        ? user.avatarUrl
        : `${apiBase.replace(/\/api$/, '')}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`)
    : null;

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        {onToggleMobileSidebar && (
          <button 
            className={styles.hamburgerBtn} 
            onClick={onToggleMobileSidebar}
            aria-label="Mở menu quản lý"
          >
            <Menu size={22} />
          </button>
        )}
      </div>      
      
      <div className={styles.topbarRight}>
        <Link 
          to="/employer/notifications" 
          className={styles.notificationBtn}
          aria-label="Thông báo nhà tuyển dụng"
        >
          <Bell size={20} />
        </Link>

        <div 
          className={styles.profileSection} 
          onClick={() => navigate('/employer/profile')}
          role="button"
          tabIndex={0}
          aria-label="Xem hồ sơ doanh nghiệp"
        >
          <div className={styles.profileInfo}>
            <div className={styles.greeting}>Xin chào, <span>{displayName}</span></div>
            <div className={styles.role}>Nhà tuyển dụng</div>
          </div>
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt="Avatar" 
              className={styles.avatarImg} 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
              }}
            />
          ) : (
            <div className={styles.avatar}>{initial}</div>
          )}
        </div>
      </div>
    </header>
  );
};
