import React, { useState, useEffect } from 'react';
import { Store, Briefcase, Users, Clock, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardOverview } from '../../../services/dashboardApi';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardOverview();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className={styles.dashboard} style={{ padding: '24px', fontSize: '1.2rem', color: 'var(--text-gray)' }}>Đang tải dữ liệu...</div>;
  }

  const data = dashboardData || {
    totalStores: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    monthlyStats: [],
    recentApplications: [],
    expiringJobs: []
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan</h1>
        <p className={styles.subtitle}>Thống kê tổng quan về hoạt động tuyển dụng và kinh doanh của bạn.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng số cửa hàng</div>
            <div className={styles.statValue}>{data.totalStores}</div>
          </div>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)', color: '#059669', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.15)' }}>
            <Store size={28} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng tin tuyển dụng</div>
            <div className={styles.statValue}>{data.totalJobs}</div>
          </div>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)', color: '#2563EB', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)' }}>
            <Briefcase size={28} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng đơn ứng tuyển</div>
            <div className={styles.statValue}>{data.totalApplications}</div>
          </div>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #E9D5FF 100%)', color: '#9333EA', boxShadow: '0 8px 16px rgba(147, 51, 234, 0.15)' }}>
            <Users size={28} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đơn chờ xử lý</div>
            <div className={styles.statValue}>{data.pendingApplications}</div>
          </div>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', color: '#EA580C', boxShadow: '0 8px 16px rgba(234, 88, 12, 0.15)' }}>
            <Clock size={28} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Đơn ứng tuyển theo tháng</div>
            <select className={styles.selectRange}>
              <option>6 tháng gần đây</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip />
                <Area type="monotone" dataKey="uv" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Đơn ứng tuyển mới nhất</div>
            <button className={styles.cardAction}>Xem tất cả</button>
          </div>
          <div className={styles.list}>
            {data.recentApplications && data.recentApplications.length > 0 ? (
              data.recentApplications.map((item: any, idx: number) => (
                <div key={idx} className={styles.listItem}>
                  <img src={item.img} alt={item.name} className={styles.avatar} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.role}</div>
                    <div className={styles.itemDesc}>{item.store}</div>
                  </div>
                  <div className={styles.itemRight}>
                    <div className={styles.timeText}>{item.time}</div>
                    <div className={`${styles.statusBadge} ${item.isPending ? styles.statusPending : styles.statusViewed}`}>{item.status}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Chưa có đơn ứng tuyển nào.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Tin tuyển dụng sắp hết hạn</div>
            <button className={styles.cardAction}>Xem tất cả</button>
          </div>
          <div className={styles.list}>
            {data.expiringJobs && data.expiringJobs.length > 0 ? (
              data.expiringJobs.map((item: any, idx: number) => (
                <div key={idx} className={styles.listItem}>
                  <img src={item.logo} alt={item.store} className={styles.jobLogo} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.store}</div>
                  </div>
                  <div className={styles.itemRight}>
                    <div className={styles.expireText}>{item.expire}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Chưa có tin tuyển dụng nào sắp hết hạn.</div>
            )}
          </div>
        </div>

        <div className={`${styles.card} ${styles.verifyCard}`}>
          <div className={styles.cardHeader} style={{marginBottom: '16px'}}>
            <div className={styles.cardTitle}>Trạng thái xác minh doanh nghiệp</div>
          </div>
          <div className={styles.verifyContent}>
            <div className={styles.verifyIcon}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className={styles.verifyTitle}>{data.verificationStatus || 'Chờ xác minh'}</div>
              <div className={styles.verifyDesc}>{data.verificationStatus === 'Đã xác minh' ? 'Tài khoản của bạn đã được xác minh.' : 'Vui lòng hoàn tất hồ sơ để được xác minh.'}</div>
              <div className={styles.verifyDate}>Ngày xác minh: {data.verificationDate || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
