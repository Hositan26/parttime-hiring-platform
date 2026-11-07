export const adminNavigation = [
  { path: '/admin/dashboard', label: 'Tổng quan', group: 'dashboard' },
  { path: '/admin/verifications', label: 'Duyệt doanh nghiệp', group: 'verifications' },
  { path: '/admin/users', label: 'Tài khoản', group: 'accounts' },
  { path: '/admin/stores', label: 'Cửa hàng', group: 'stores' },
  { path: '/admin/jobs', label: 'Kiểm duyệt tin tuyển dụng', group: 'jobs' },
  { path: '/admin/reports', label: 'Báo cáo và đánh giá', group: 'moderation' },
  { path: '/admin/categories', label: 'Danh mục', group: 'catalog' },
] as const;

export const adminGroup = (path: string): string => {
  if (/^\/admin\/(users|employers)(\/|$)/.test(path)) return 'accounts';
  if (/^\/admin\/(reports|reviews)(\/|$)/.test(path)) return 'moderation';
  if (/^\/admin\/(categories|shifts)(\/|$)/.test(path)) return 'catalog';
  return adminNavigation.find(item => item.path === path)?.group || 'dashboard';
};
