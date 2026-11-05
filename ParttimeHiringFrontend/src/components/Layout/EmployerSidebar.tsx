import { logout } from '../../services/auth.service';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Briefcase, FileText, User, Home, LogOut, Users, Bell, X } from 'lucide-react';
import styles from './EmployerLayout.module.css';

interface EmployerSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const EmployerSidebar: React.FC<EmployerSidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Tổng quan', path: '/employer/dashboard', icon: <LayoutDashboard className={styles.navItemIcon} /> },
    { name: 'Cửa hàng', path: '/employer/stores', icon: <Store className={styles.navItemIcon} /> },
    { name: 'Tin tuyển dụng', path: '/employer/jobs', icon: <Briefcase className={styles.navItemIcon} /> },
    { name: 'Đơn ứng tuyển', path: '/employer/applications', icon: <FileText className={styles.navItemIcon} /> },
    { name: 'Thông báo', path: '/employer/notifications', icon: <Bell className={styles.navItemIcon} /> },
    { name: 'Nhân sự', path: '/employer/employees', icon: <Users className={styles.navItemIcon} /> },
    { name: 'Hồ sơ', path: '/employer/profile', icon: <User className={styles.navItemIcon} /> },
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`${styles.sidebar} ${isOpenMobile ? styles.sidebarOpenMobile : ''}`}>
      <div className={styles.logoArea}>
        <div className={styles.logoBadge}>
          <Briefcase size={20} color="white" />
        </div>
        <div className={styles.logoTextWrapper}>
          <span className={styles.logoBrand}>JobPortal</span>
          <span className={styles.logoPortal}>Employer</span>
        </div>
        {onCloseMobile && (
          <button className={styles.closeMobileBtn} onClick={onCloseMobile} aria-label="Đóng menu">
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className={styles.navMenu}>
        <div className={styles.menuGroupTitle}>QUẢN LÝ DOANH NGHIỆP</div>
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            onClick={handleLinkClick}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

        <div className={styles.sidebarBottomActions}>
          <button 
            className={styles.navItem} 
            onClick={() => { handleLinkClick(); navigate('/jobs'); }}
          >
            <Home className={styles.navItemIcon} />
            <span>Về trang tìm việc</span>
          </button>
          <button 
            className={`${styles.navItem} ${styles.logoutNavBtn}`} 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut className={styles.navItemIcon} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
