import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, Activity, TrendingUp } from 'lucide-react';
import { getDashboardStats, type AdminDashboardStats } from '../../../services/adminDashboard.service';
import styles from '../Verifications/AdminVerifications.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Người tìm việc mới (Tháng này)', uv: stats?.newUsersThisMonth || 0, fill: '#0284c7' },
    { name: 'Doanh nghiệp mới (Tháng này)', uv: stats?.newEmployersThisMonth || 0, fill: '#ca8a04' }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan hệ thống</h1>
        <p className={styles.subtitle}>Chào mừng trở lại. Dưới đây là các số liệu tóm tắt về nền tảng.</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải số liệu...</div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Card 1 */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tổng User</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={14} /> +{stats.newUsersThisMonth} tháng này
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Nhà tuyển dụng</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalEmployers}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={14} /> +{stats.newEmployersThisMonth} tháng này
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Công việc</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalJobs}</div>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Lượt ứng tuyển</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalApplications}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '300px' }}>
        <h3 style={{ marginBottom: '24px', color: '#334155' }}>Thống kê Tăng trưởng Tháng Này</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend />
              <Bar dataKey="uv" name="Số lượng đăng ký mới" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
