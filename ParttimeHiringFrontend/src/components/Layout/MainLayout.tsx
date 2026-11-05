import { logout } from '../../services/auth.service';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Bell, LogOut, User as UserIcon, Menu, X, LayoutDashboard } from 'lucide-react';
import styles from './MainLayout.module.css';
import { useAuth } from '../../context/authContext';
import { apiBase } from '../../services/apiClient';
import { hasAnyRole } from '../../services/authPolicy';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEmployer = hasAnyRole(user?.roles || [], ['EMPLOYER']);

  // Role-based Nav Links
  const navLinks = isEmployer
    ? [
        { name: 'Việc làm', path: '/jobs' },
      ]
    : !user
      ? [
          { name: 'Việc làm', path: '/jobs' },
          { name: 'Đăng ký tuyển dụng', path: '/verify-business' },
        ]
      : [
          { name: 'Việc làm', path: '/jobs' },
          { name: 'Đã lưu', path: '/saved-jobs' },
          { name: 'Đã ứng tuyển', path: '/applied-jobs' },
          { name: 'CV của tôi', path: '/candidate-profile' },
          { name: 'Lịch sử làm việc', path: '/employment-history' },
          { name: 'Đăng ký tuyển dụng', path: '/verify-business' },
        ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className={styles.layout}>
      {/* Navbar */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <button 
              className={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/jobs" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Briefcase size={18} color="white" />
              </div>
              <span className={styles.logoText}>JobPortal</span>
            </Link>
          </div>

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
            {!user ? (
              <div className={styles.guestAuthGroup}>
                <Link to="/login" className={styles.loginBtn}>Đăng nhập</Link>
                <Link to="/register" className={styles.registerBtn}>Đăng ký</Link>
              </div>
            ) : (
              <>
                {isEmployer && (
                  <Link 
                    to="/employer/dashboard" 
                    className={styles.employerPortalBtn}
                    title="Kênh quản trị tuyển dụng của bạn"
                  >
                    <LayoutDashboard size={15} />
                    <span>Kênh Quản trị</span>
                  </Link>
                )}

                <Link to="/notifications" className={styles.iconBtn} aria-label="Thông báo">
                  <Bell size={20} />
                </Link>

                <Link to="/profile" className={styles.userMenu} title="Cài đặt tài khoản & Bảo mật">
                  {user?.avatarUrl && user.avatarUrl !== 'null' ? (
                    <img 
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${apiBase.replace(/\/api$/, '')}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`} 
                      alt="Avatar" 
                      className={styles.userAvatar} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'Bạn')}&background=random`;
                      }}
                    />
                  ) : (
                    <div className={styles.userAvatarFallback}>
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className={styles.userNameText}>
                    {user?.displayName || user?.username || 'Bạn'}
                  </span>
                </Link>

                <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Đăng xuất">
                  <LogOut size={16} />
                  <span className={styles.logoutText}>Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileNav}>
            {isEmployer && (
              <Link
                to="/employer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={styles.mobileEmployerBtn}
              >
                <LayoutDashboard size={16} />
                <span>Kênh Quản trị Doanh nghiệp</span>
              </Link>
            )}

            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.mobileActive : ''}`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`${styles.mobileNavLink} ${location.pathname === '/profile' ? styles.mobileActive : ''}`}
              >
                Cài đặt tài khoản
              </Link>
            )}

            <div className={styles.mobileNavDivider} />

            {user ? (
              <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={styles.loginBtn}
                  style={{ flex: 1, textAlign: 'center', border: '1px solid #cbd5e1' }}
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={styles.registerBtn}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
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
