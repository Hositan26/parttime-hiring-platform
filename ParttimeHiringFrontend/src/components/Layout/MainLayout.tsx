import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Bell, LogOut, User as UserIcon } from 'lucide-react';
import styles from './MainLayout.module.css';
import { getMe } from '../../services/auth.service';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe()
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

  const isEmployer = user?.roles?.some((r: any) => r.name === 'ROLE_EMPLOYER' || r === 'ROLE_EMPLOYER' || r === 'EMPLOYER') || user?.roles?.includes('EMPLOYER');

  const navLinks = [
    { name: 'Jobs', path: '/jobs' },
    { name: 'Đã ứng tuyển', path: '/applied-jobs' },
    { name: 'Profile', path: '/profile' },
    { 
      name: isEmployer ? 'Quản lý doanh nghiệp' : 'Xác minh doanh nghiệp', 
      path: isEmployer ? '/employer/dashboard' : '/verify-business' 
    }
  ];

  return (
    <div className={styles.layout}>
      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <Link to="/jobs" className={styles.logo} style={{ textDecoration: 'none' }}>
            <div className={styles.logoIcon}>
              <Briefcase size={18} color="white" />
            </div>
            <span className={styles.logoText}>JobPortal</span>
          </Link>

          <nav className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className={styles.navRight}>
            <button className={styles.iconBtn}>
              <Bell size={20} />
            </button>

            <div className={styles.userMenu}>
              {user?.avatarUrl && user.avatarUrl !== 'null' ? (
                <img 
                  src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8088/parttime_hiring_platform${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`} 
                  alt="Avatar" 
                  className={styles.userAvatar} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'Bạn')}&background=random`;
                  }}
                />
              ) : (
                <UserIcon size={18} />
              )}
              <span>Xin chào, {user?.displayName || user?.username || 'Bạn'}</span>
            </div>

            <button onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }} className={styles.logoutBtn}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={`${styles.contentContainer} animate-fade-in-up`}>
          {children}
        </div>
      </main>
    </div>
  );
};
