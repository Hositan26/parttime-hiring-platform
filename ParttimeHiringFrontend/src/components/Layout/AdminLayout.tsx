import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileCheck2,
  Users,
  Store,
  Briefcase,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { logout } from '../../services/auth.service';
import { useAuth } from '../../context/authContext';
import { adminNavigation, adminGroup } from '../../services/adminNavigation';
import styles from './AdminLayout.module.css';

const tabs: Record<string, { path: string; label: string }[]> = {
  accounts: [
    { path: '/admin/users', label: 'Người dùng' },
    { path: '/admin/employers', label: 'Doanh nghiệp' }
  ],
  moderation: [
    { path: '/admin/reports', label: 'Báo cáo' },
    { path: '/admin/reviews', label: 'Đánh giá' }
  ],
  catalog: [
    { path: '/admin/categories', label: 'Ngành nghề' },
    { path: '/admin/shifts', label: 'Ca làm' }
  ],
};

const getNavIcon = (group: string) => {
  switch (group) {
    case 'dashboard':
      return <LayoutDashboard size={18} />;
    case 'verifications':
      return <FileCheck2 size={18} />;
    case 'accounts':
      return <Users size={18} />;
    case 'stores':
      return <Store size={18} />;
    case 'jobs':
      return <Briefcase size={18} />;
    case 'moderation':
      return <AlertTriangle size={18} />;
    case 'catalog':
      return <FolderTree size={18} />;
    default:
      return <ShieldCheck size={18} />;
  }
};

export const AdminLayout = () => {
  const { user, reload } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const group = adminGroup(location.pathname);
  const currentNav = adminNavigation.find(item => item.group === group);
  const title = currentNav?.label || 'Quản trị hệ thống';

  const userInitial = (user?.displayName || user?.username || 'A').charAt(0).toUpperCase();

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`} aria-label="Thanh điều hướng chính">
        <div className={styles.sidebarHeader}>
          <Link to="/admin/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>
              <ShieldCheck size={22} />
            </div>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>JobPortal</span>
              <span className={styles.logoSubtitle}>Admin Portal</span>
            </div>
          </Link>
          <button
            className={styles.mobileCloseBtn}
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navMenu} aria-label="Quản trị hệ thống">
          <span className={styles.navSectionLabel}>Chức năng quản trị</span>
          {adminNavigation.map(item => {
            const isActive = item.group === group;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIconWrapper}>
                  {getNavIcon(item.group)}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/jobs" className={styles.publicPortalLink} title="Chuyển đến giao diện tìm việc">
            <span>Khu vực tìm việc</span>
            <ExternalLink size={14} />
          </Link>

          <button
            className={styles.logoutBtn}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                await logout();
                await reload();
                navigate('/login', { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Không đăng xuất được');
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut size={16} />
            <span>{busy ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.mobileMenu}
              aria-label="Mở menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className={styles.breadcrumbGroup}>
              <span className={styles.breadcrumbRoot}>Quản trị</span>
              <ChevronRight size={14} className={styles.breadcrumbSep} />
              <h2 className={styles.topbarTitle}>{title}</h2>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.adminUserBadge} title="Tài khoản Quản trị viên">
              <div className={styles.adminAvatar}>
                {userInitial}
              </div>
              <div className={styles.adminDetails}>
                <span className={styles.adminName}>{user?.displayName || user?.username}</span>
                <span className={styles.adminRoleTag}>Quản trị viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className={styles.pageContent}>
          {error && (
            <div className={styles.alertBanner} role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Subtabs for multi-route groups */}
          {tabs[group] && (
            <nav className={styles.sectionTabs} aria-label="Nhóm chức năng">
              {tabs[group].map(tab => {
                const isTabActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={isTabActive ? styles.activeTab : ''}
                    aria-current={isTabActive ? 'page' : undefined}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
};
