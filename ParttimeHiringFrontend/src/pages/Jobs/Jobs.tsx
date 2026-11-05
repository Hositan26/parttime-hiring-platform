import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { JobCard } from '../../components/JobCard/JobCard';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Filter, RefreshCcw, Search, Briefcase, ChevronLeft, ChevronRight, AlertCircle, X, SlidersHorizontal } from 'lucide-react';
import { searchJobPage, getCategories, getShifts, type Job, type JobCategory, type JobShift } from '../../services/job.service';
import styles from './Jobs.module.css';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const requestVersion = useRef(0);
  
  const [filters, setFilters] = useState({
    title: '', storeName: '', categoryId: '', shiftId: '',
    minWage: '', maxWage: '', city: '', district: '', ward: '', streetAddress: ''
  });
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [shifts, setShifts] = useState<JobShift[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getShifts()]).then(([cats, shfs]) => {
      setCategories(cats);
      setShifts(shfs);
    });
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const version = ++requestVersion.current;
      if ((filters.minWage && Number(filters.minWage) < 0) || (filters.maxWage && Number(filters.maxWage) < 0)
        || (filters.minWage && filters.maxWage && Number(filters.minWage) > Number(filters.maxWage))) {
        setError('Mức lương phải không âm và mức tối đa phải lớn hơn hoặc bằng mức tối thiểu.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const data = await searchJobPage(filters, page);
        if (!active || version !== requestVersion.current) return;
        setJobs(data.content);
        setTotalPages(data.totalPages);
        setTotal(data.totalElements);
      } catch (error) {
        if (active && version === requestVersion.current) setError(error instanceof Error ? error.message : 'Không thể tải danh sách việc làm.');
      } finally {
        if (active && version === requestVersion.current) setLoading(false);
      }

    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [filters, page]);

  const handleFilterChange = (field: string, value: string) => {
    requestVersion.current++;
    setPage(0);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    requestVersion.current++;
    setPage(0);
    setFilters({
      title: '', storeName: '', categoryId: '', shiftId: '',
      minWage: '', maxWage: '', city: '', district: '', ward: '', streetAddress: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(val => Boolean(val)).length;

  const filterContent = (
    <>
      <div className={styles.filterHeader}>
        <div className={styles.filterIcon}><Filter size={18} /></div>
        <div style={{ flex: 1 }}>
          <h3>Bộ lọc tìm kiếm</h3>
          <p>Tinh chỉnh danh sách công việc theo nhu cầu của bạn</p>
        </div>
        {mobileFilterOpen && (
          <button 
            type="button" 
            className={styles.closeFilterBtn} 
            onClick={() => setMobileFilterOpen(false)}
            aria-label="Đóng bộ lọc"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Thông tin cơ bản</h4>
        <Input 
          label="Tên công việc" 
          placeholder="Ví dụ: phục vụ, pha chế..." 
          value={filters.title} 
          onChange={(e) => handleFilterChange('title', e.target.value)} 
        />
        <Input 
          label="Tên cửa hàng" 
          placeholder="Ví dụ: Highlands, Phúc Long..." 
          value={filters.storeName} 
          onChange={(e) => handleFilterChange('storeName', e.target.value)} 
        />
        <div className={styles.splitInputs}>
          <div className={styles.selectGroup}>
            <label>Ngành nghề</label>
            <select className={styles.select} value={filters.categoryId} onChange={(e) => handleFilterChange('categoryId', e.target.value)}>
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </div>
          <div className={styles.selectGroup}>
            <label>Ca làm việc</label>
            <select className={styles.select} value={filters.shiftId} onChange={(e) => handleFilterChange('shiftId', e.target.value)}>
              <option value="">Tất cả</option>
              {shifts.map(s => <option key={s.shiftId} value={s.shiftId}>{s.shiftName}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Mức lương theo giờ (VND)</h4>
        <div className={styles.splitInputs}>
          <Input label="Từ" placeholder="20000" type="number" min="0" value={filters.minWage} onChange={(e) => handleFilterChange('minWage', e.target.value)} />
          <Input label="Đến" placeholder="50000" type="number" min="0" value={filters.maxWage} onChange={(e) => handleFilterChange('maxWage', e.target.value)} />
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Khu vực làm việc</h4>
        <Input label="Thành phố" placeholder="Ví dụ: Đà Nẵng, Hà Nội..." value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
        <div className={styles.splitInputs}>
          <Input label="Quận / Huyện" placeholder="Hải Châu" value={filters.district} onChange={(e) => handleFilterChange('district', e.target.value)} />
          <Input label="Phường / Xã" placeholder="Phước Ninh" value={filters.ward} onChange={(e) => handleFilterChange('ward', e.target.value)} />
        </div>
        <Input label="Địa chỉ đường" placeholder="Ví dụ: 12 Lê Duẩn" value={filters.streetAddress} onChange={(e) => handleFilterChange('streetAddress', e.target.value)} />
      </div>

      <div className={styles.filterActions}>
        <Button variant="outline" fullWidth className={styles.clearBtn} onClick={handleClearFilters}>
          <RefreshCcw size={16} style={{ marginRight: '8px' }} />
          Xóa tất cả lọc
        </Button>
        {mobileFilterOpen && (
          <Button variant="primary" fullWidth onClick={() => setMobileFilterOpen(false)}>
            Xem kết quả ({total})
          </Button>
        )}
      </div>
    </>
  );

  return (
    <MainLayout>
      <div className={styles.heroSection}>
        <div className={styles.heroBadge}>✨ Nền tảng việc làm part-time hiện đại</div>
        <h1 className={styles.heroTitle}>Tìm việc làm part-time phù hợp nhất với bạn</h1>
        <p className={styles.heroSubtitle}>
          Khám phá cơ hội việc làm theo ca linh hoạt, mức lương rõ ràng và địa điểm thuận tiện gần bạn.
        </p>
        <div className={styles.statsCard}>
          <div className={styles.heroStatsIcon}>
            <Briefcase size={24} />
          </div>
          <div>
            <p className={styles.statsLabel}>VIỆC LÀM ĐANG TUYỂN</p>
            <p className={styles.statsValue}>{total}</p>
          </div>
        </div>
      </div>

      {/* Mobile filter trigger pill */}
      <div className={styles.mobileFilterBar}>
        <button 
          className={styles.mobileFilterTrigger} 
          onClick={() => setMobileFilterOpen(true)}
        >
          <SlidersHorizontal size={18} />
          <span>Bộ lọc tìm kiếm</span>
          {activeFilterCount > 0 && (
            <span className={styles.filterCountBadge}>{activeFilterCount}</span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button className={styles.mobileResetFilter} onClick={handleClearFilters}>
            <RefreshCcw size={14} /> Xóa lọc
          </button>
        )}
      </div>

      <div className={styles.mainGrid}>
        {/* Desktop Sidebar Filters */}
        <aside className={styles.sidebar}>
          {filterContent}
        </aside>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterOpen && (
          <div className={styles.mobileDrawerOverlay} onClick={() => setMobileFilterOpen(false)}>
            <div className={styles.mobileDrawerContent} onClick={(e) => e.stopPropagation()}>
              {filterContent}
            </div>
          </div>
        )}

        {/* Job Listings */}
        <div className={styles.jobContent}>
          <div className={styles.jobListHeader}>
            <div>
              <h2>Danh sách việc làm</h2>
              <p>Các tin tuyển dụng mới nhất được cập nhật liên tục</p>
            </div>
            <div className={styles.resultBadge}>
              <Search size={14} /> Tìm thấy <strong>{total}</strong> việc làm
            </div>
          </div>

          {error && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Đang tìm kiếm việc làm phù hợp...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIconBox}>
                <Briefcase size={40} />
              </div>
              <h3>Không tìm thấy công việc phù hợp</h3>
              <p>Hãy thử thay đổi hoặc xóa bớt tiêu chí lọc để tiếp cận nhiều cơ hội việc làm hơn.</p>
              {activeFilterCount > 0 && (
                <button className="btn-primary" onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
                  <RefreshCcw size={16} /> Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className={styles.jobGrid}>
              {jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  {...job} 
                />
              ))}
            </div>
          )}

          {!error && totalPages > 1 && (
            <nav className={styles.paginationNav} aria-label="Phân trang việc làm">
              <button 
                className="btn-outline" 
                disabled={loading || page === 0} 
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} /> Trang trước
              </button>
              <span className={styles.paginationText}>
                Trang <strong>{page + 1}</strong> / {totalPages}
              </span>
              <button 
                className="btn-outline" 
                disabled={loading || page + 1 >= totalPages} 
                onClick={() => setPage(page + 1)}
              >
                Trang sau <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
