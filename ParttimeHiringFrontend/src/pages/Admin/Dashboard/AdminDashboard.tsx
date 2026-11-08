import React from 'react';
import { Link } from 'react-router-dom';
import { useApiResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import {
  Users,
  Briefcase,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  Store,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { type AdminDashboardStats } from '../../../services/adminDashboard.service';
import styles from '../Verifications/AdminVerifications.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { data: stats, loading, error } = useApiResource<AdminDashboardStats>(`${apiBase}/admin/dashboard/stats`);

  const chartData = [
    { name: 'Người tìm việc mới (Tháng này)', uv: stats?.newUsersThisMonth ?? 0, fill: '#00b14f' },
    { name: 'Doanh nghiệp mới (Tháng này)', uv: stats?.newEmployersThisMonth ?? 0, fill: '#10b981' }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan hệ thống</h1>
        <p className={styles.subtitle}>Báo cáo số liệu thời gian thực và các hạng mục kiểm duyệt cần xử lý.</p>
      </div>

      {error && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Actionable Queues Attention Bar */}
      {stats && (
        <div className={styles.queuesCard} aria-label="Các hàng chờ cần duyệt">
          <div className={styles.queuesTitle}>
            <ShieldCheck size={18} color="#00b14f" />
            <span>Hàng chờ kiểm duyệt:</span>
          </div>

          <div className={styles.queuesGroup}>
            <Link
              to="/admin/verifications"
              className={`${styles.queuePill} ${stats.pendingVerifications > 0 ? styles.queuePillActive : ''}`}
            >
              <Clock size={14} color={stats.pendingVerifications > 0 ? '#059669' : '#64748b'} />
              <span>Hồ sơ doanh nghiệp</span>
              <span className={styles.queuePillCount}>{stats.pendingVerifications}</span>
              <ChevronRight size={13} color="#94a3b8" />
            </Link>

            <Link
              to="/admin/stores"
              className={`${styles.queuePill} ${stats.pendingStores > 0 ? styles.queuePillActive : ''}`}
            >
              <Store size={14} color={stats.pendingStores > 0 ? '#059669' : '#64748b'} />
              <span>Cửa hàng / Chi nhánh</span>
              <span className={styles.queuePillCount}>{stats.pendingStores}</span>
              <ChevronRight size={13} color="#94a3b8" />
            </Link>

            <Link
              to="/admin/reports"
              className={`${styles.queuePill} ${stats.pendingReports > 0 ? styles.queuePillActive : ''}`}
            >
              <AlertCircle size={14} color={stats.pendingReports > 0 ? '#d97706' : '#64748b'} />
              <span>Báo cáo khiếu nại</span>
              <span className={styles.queuePillCount}>{stats.pendingReports}</span>
              <ChevronRight size={13} color="#94a3b8" />
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.emptyIconWrapper}>
            <Activity size={28} />
          </div>
          <p className={styles.emptyStateText}>Đang tổng hợp số liệu hệ thống...</p>
        </div>
      ) : stats ? (
        <>
          {/* KPI 4 Cards */}
          <div className={styles.kpiGrid}>
            {/* Card 1: Tổng User */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper}>
                <Users size={26} />
              </div>
              <div>
                <div className={styles.kpiLabel}>Người tìm việc</div>
                <div className={styles.kpiValue}>{stats.totalUsers}</div>
                <div className={styles.kpiTrend}>
                  <TrendingUp size={13} />
                  <span>+{stats.newUsersThisMonth} tháng này</span>
                </div>
              </div>
            </div>

            {/* Card 2: Doanh nghiệp */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Briefcase size={26} />
              </div>
              <div>
                <div className={styles.kpiLabel}>Nhà tuyển dụng</div>
                <div className={styles.kpiValue}>{stats.totalEmployers}</div>
                <div className={styles.kpiTrend} style={{ color: '#2563eb' }}>
                  <TrendingUp size={13} />
                  <span>+{stats.newEmployersThisMonth} tháng này</span>
                </div>
              </div>
            </div>

            {/* Card 3: Công việc */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Activity size={26} />
              </div>
              <div>
                <div className={styles.kpiLabel}>Tin tuyển dụng</div>
                <div className={styles.kpiValue}>{stats.totalJobs}</div>
                <div className={styles.subText} style={{ marginTop: '4px' }}>Tổng số bài đăng</div>
              </div>
            </div>

            {/* Card 4: Lượt ứng tuyển */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <FileText size={26} />
              </div>
              <div>
                <div className={styles.kpiLabel}>Lượt ứng tuyển</div>
                <div className={styles.kpiValue}>{stats.totalApplications}</div>
                <div className={styles.subText} style={{ marginTop: '4px' }}>Từ ứng viên gửi đến</div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Tăng trưởng Tài khoản Mới Trong Tháng</h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={13} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={13} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend />
                  <Bar dataKey="uv" name="Số lượng đăng ký mới" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
