import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Briefcase, FileText, User } from 'lucide-react';
import styles from './EmployerLayout.module.css';

export const EmployerSidebar: React.FC = () => {
  const menuItems = [
    { name: 'Tổng quan', path: '/employer/dashboard', icon: <LayoutDashboard className={styles.navItemIcon} /> },
    { name: 'Cửa hàng', path: '/employer/stores', icon: <Store className={styles.navItemIcon} /> },
    { name: 'Tin tuyển dụng', path: '/employer/jobs', icon: <Briefcase className={styles.navItemIcon} /> },
    { name: 'Đơn ứng tuyển', path: '/employer/applications', icon: <FileText className={styles.navItemIcon} /> },
    { name: 'Hồ sơ', path: '/employer/profile', icon: <User className={styles.navItemIcon} /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea} style={{ padding: '24px 24px 12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ backgroundColor: 'var(--primary)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Briefcase size={20} color="white" />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>JobPortal</span>
      </div>
      
      <nav className={styles.navMenu}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
