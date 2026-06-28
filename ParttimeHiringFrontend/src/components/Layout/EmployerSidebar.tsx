import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Briefcase, FileText, User, Home, LogOut, Users } from 'lucide-react';
import styles from './EmployerLayout.module.css';

export const EmployerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Tổng quan', path: '/employer/dashboard', icon: <LayoutDashboard className={styles.navItemIcon} /> },
    { name: 'Cửa hàng', path: '/employer/stores', icon: <Store className={styles.navItemIcon} /> },
    { name: 'Tin tuyển dụng', path: '/employer/jobs', icon: <Briefcase className={styles.navItemIcon} /> },
    { name: 'Đơn ứng tuyển', path: '/employer/applications', icon: <FileText className={styles.navItemIcon} /> },
    { name: 'Nhân sự', path: '/employer/employees', icon: <Users className={styles.navItemIcon} /> },
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

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className={styles.navItem} 
            onClick={() => navigate('/jobs')}
            style={{ width: '100%', background: 'none', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.95rem' }}
          >
            <Home className={styles.navItemIcon} />
            Về trang chủ
          </button>
          <button 
            className={styles.navItem} 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              navigate('/login');
            }}
            style={{ width: '100%', background: 'none', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.95rem', color: '#ef4444' }}
          >
            <LogOut className={styles.navItemIcon} style={{ color: '#ef4444' }} />
            Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  );
};
