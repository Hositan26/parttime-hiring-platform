import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../../services/auth.service';
import { useAuth } from '../../context/authContext';
import { adminNavigation, adminGroup } from '../../services/adminNavigation';
import styles from './AdminLayout.module.css';

const tabs: Record<string, { path: string; label: string }[]> = {
  accounts: [{ path: '/admin/users', label: 'Người dùng' }, { path: '/admin/employers', label: 'Doanh nghiệp' }],
  moderation: [{ path: '/admin/reports', label: 'Báo cáo' }, { path: '/admin/reviews', label: 'Đánh giá' }],
  catalog: [{ path: '/admin/categories', label: 'Ngành nghề' }, { path: '/admin/shifts', label: 'Ca làm' }],
};

export const AdminLayout = () => {
  const { user, reload } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const group = adminGroup(location.pathname);
  const title = adminNavigation.find(item => item.group === group)?.label;
  return <div className={styles.adminLayout}>
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarHeader}><div className={styles.logo}><ShieldCheck /> Admin Portal</div>
        <button className={styles.mobileMenu} aria-label="Đóng menu" onClick={() => setOpen(false)}><X /></button></div>
      <nav className={styles.navMenu} aria-label="Quản trị hệ thống">
        {adminNavigation.map(item => <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
          aria-current={item.group === group ? 'page' : undefined}
          className={`${styles.navItem} ${item.group === group ? styles.navItemActive : ''}`}>{item.label}</Link>)}
      </nav>
      <div className={styles.sidebarFooter}><Link to="/jobs">Khu vực người tìm việc</Link>
        <button className={styles.logoutBtn} disabled={busy} onClick={async () => {
          setBusy(true); setError('');
          try { await logout(); await reload(); navigate('/login', { replace: true }); }
          catch (error) { setError(error instanceof Error ? error.message : 'Không đăng xuất được'); }
          finally { setBusy(false); }
        }}><LogOut size={18} />{busy ? 'Đang đăng xuất...' : 'Đăng xuất'}</button></div>
    </aside>
    <main className={styles.mainContent}>
      <header className={styles.topbar}><button className={styles.mobileMenu} aria-label="Mở menu" onClick={() => setOpen(true)}><Menu /></button>
        <strong>{title}</strong><span>{user?.displayName || user?.username} · Admin</span></header>
      <div className={styles.pageContent}>
        {error && <p role="alert">{error}</p>}
        {tabs[group] && <nav className={styles.sectionTabs} aria-label="Nhóm chức năng">
          {tabs[group].map(tab => <Link className={location.pathname === tab.path ? styles.activeTab : ''} aria-current={location.pathname === tab.path ? 'page' : undefined} key={tab.path} to={tab.path}>{tab.label}</Link>)}
        </nav>}
        <Outlet />
      </div>
    </main>
  </div>;
};
