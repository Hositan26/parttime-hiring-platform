import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { getMe } from '../../services/auth.service';
import styles from './EmployerLayout.module.css';

export const EmployerTopbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const displayName = user?.displayName || 'Nhà Tuyển Dụng';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className={styles.topbar}>
      <div></div>      
      <div className={styles.topbarRight}>
        <button className={styles.notificationBtn}>
          <Bell size={24} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <div className={styles.greeting}>Xin chào, <span>{displayName}</span></div>
            <div className={styles.role}>Employer</div>
          </div>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className={styles.avatarImg} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatar}>{initial}</div>
          )}
          <ChevronDown size={16} color="var(--text-gray)" />
        </div>
      </div>
    </header>
  );
};
