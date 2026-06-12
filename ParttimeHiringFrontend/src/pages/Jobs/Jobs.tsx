import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { JobCard } from '../../components/JobCard/JobCard';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Filter, RefreshCcw } from 'lucide-react';
import { searchJobs, getCategories, getShifts, type Job } from '../../services/job.service';
import styles from './Jobs.module.css';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    title: '', storeName: '', categoryId: '', shiftId: '',
    minWage: '', maxWage: '', city: '', district: '', ward: '', streetAddress: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getShifts()]).then(([cats, shfs]) => {
      setCategories(cats);
      setShifts(shfs);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredJobs();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchFilteredJobs = async () => {
    try {
      setLoading(true);
      const data = await searchJobs(filters);
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      title: '', storeName: '', categoryId: '', shiftId: '',
      minWage: '', maxWage: '', city: '', district: '', ward: '', streetAddress: ''
    });
  };

  return (
    <MainLayout>
      <div className={styles.heroSection}>
        <div className={styles.heroBadge}>✨ Nền tảng việc làm part-time hiện đại</div>
        <h1 className={styles.heroTitle}>Nền tảng tìm việc part-time dành cho bạn</h1>
        <p className={styles.heroSubtitle}>
          Khám phá các cơ hội việc làm theo ca phù hợp với thời gian, địa điểm và kỹ năng của bạn một cách nhanh chóng và thuận tiện.
        </p>
        <div className={styles.statsCard}>
          <BriefcaseIcon />
          <div>
            <p className={styles.statsLabel}>VIỆC LÀM ĐANG HIỂN THỊ</p>
            <p className={styles.statsValue}>{jobs.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterHeader}>
            <div className={styles.filterIcon}><Filter size={18} /></div>
            <div>
              <h3>Bộ lọc tìm kiếm</h3>
              <p>Tinh chỉnh danh sách công việc theo nhu cầu của bạn</p>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Thông tin cơ bản</h4>
            <Input label="Tên công việc" placeholder="Ví dụ: phục vụ, pha chế..." value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
            <Input label="Tên cửa hàng" placeholder="Ví dụ: Highlands, Phúc Long..." value={filters.storeName} onChange={(e) => handleFilterChange('storeName', e.target.value)} />
            <div className={styles.splitInputs}>
              <div className={styles.selectGroup}>
                <label>Danh mục</label>
                <select className={styles.select} value={filters.categoryId} onChange={(e) => handleFilterChange('categoryId', e.target.value)}>
                  <option value="">Tất cả</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
              </div>
              <div className={styles.selectGroup}>
                <label>Ca làm</label>
                <select className={styles.select} value={filters.shiftId} onChange={(e) => handleFilterChange('shiftId', e.target.value)}>
                  <option value="">Tất cả</option>
                  {shifts.map(s => <option key={s.shiftId} value={s.shiftId}>{s.shiftName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Mức lương theo giờ</h4>
            <div className={styles.splitInputs}>
              <Input label="Từ" placeholder="20000" type="number" value={filters.minWage} onChange={(e) => handleFilterChange('minWage', e.target.value)} />
              <Input label="Đến" placeholder="35000" type="number" value={filters.maxWage} onChange={(e) => handleFilterChange('maxWage', e.target.value)} />
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Khu vực làm việc</h4>
            <Input label="Thành phố" placeholder="Ví dụ: Đà Nẵng, Hà Nội..." value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
            <Input label="Quận / Huyện" placeholder="Ví dụ: Hải Châu" value={filters.district} onChange={(e) => handleFilterChange('district', e.target.value)} />
            <Input label="Phường / Xã" placeholder="Ví dụ: Phước Ninh" value={filters.ward} onChange={(e) => handleFilterChange('ward', e.target.value)} />
            <Input label="Địa chỉ đường" placeholder="Ví dụ: 12 Lê Duẩn" value={filters.streetAddress} onChange={(e) => handleFilterChange('streetAddress', e.target.value)} />
          </div>

          <Button variant="outline" fullWidth className={styles.clearBtn} onClick={handleClearFilters}>
            <RefreshCcw size={16} style={{ marginRight: '8px' }} />
            Xóa tất cả lọc
          </Button>
        </aside>

        {/* Job Listings */}
        <div className={styles.jobContent}>
          <div className={styles.jobListHeader}>
            <div>
              <h2>Danh sách việc làm</h2>
              <p>Các công việc mới nhất đang tuyển dụng</p>
            </div>
            <div className={styles.resultBadge}>
              🔍 Tìm thấy <strong>{jobs.length}</strong> việc làm
            </div>
          </div>

          <div className={styles.jobGrid}>
            {loading ? (
              <p>Đang tải danh sách công việc...</p>
            ) : jobs.length === 0 ? (
              <p>Chưa có công việc nào.</p>
            ) : (
              jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  {...job} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const BriefcaseIcon = () => (
  <div className={styles.heroStatsIcon}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  </div>
);
