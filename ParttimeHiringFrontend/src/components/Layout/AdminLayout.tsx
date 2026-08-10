import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, Briefcase, List, Clock, MessageSquare, LogOut, Search, Bell, Store } from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

    const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/admin/verifications', icon: <ShieldCheck size={20} />, label: 'Duyệt doanh nghiệp' },
    { path: '/admin/employers', icon: <Briefcase size={20} />, label: 'Nhà tuyển dụng' },
    { path: '/admin/jobs', icon: <List size={20} />, label: 'Tin tuyển dụng' },
    { path: '/admin/stores', icon: <Store size={20} />, label: 'Cửa hàng/Chi nhánh' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Người tìm việc' },
    { path: '/admin/categories', icon: <List size={20} />, label: 'Ngành nghề' },
    { path: '/admin/shifts', icon: <Clock size={20} />, label: 'Ca làm việc' },
    { path: '/admin/reviews', icon: <MessageSquare size={20} />, label: 'Đánh giá' },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <ShieldCheck size={24} color="white" />
            </div>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <div className={styles.navSection}>QUẢN TRỊ HỆ THỐNG</div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Tìm kiếm nhanh..." className={styles.searchInput} />
          </div>
          
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn}>
              <Bell size={20} />
              <span className={styles.badge}>3</span>
            </button>
            <div className={styles.adminProfile}>
              <div className={styles.avatar}>A</div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>Administrator</span>
                <span className={styles.adminRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
