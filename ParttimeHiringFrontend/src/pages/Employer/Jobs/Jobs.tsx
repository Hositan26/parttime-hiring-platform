import React, { useState, useEffect, useRef } from 'react';
import { Plus, Briefcase, PlayCircle, StopCircle, Search, Eye, MapPin, ChevronLeft, ChevronRight, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateJobModal } from './CreateJobModal';
import { JobDetailDrawer } from './JobDetailDrawer';
import styles from './Jobs.module.css';
import { getEmployerJobs, getEmployerStores, updateJobStatus, deleteEmployerJob, type EmployerJobListDTO } from '../../../services/employerJobApi';

const StatusDropdown: React.FC<{ status: string, onChange: (val: string) => void }> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.customSelectWrapper} ref={dropdownRef}>
      <div 
        className={`${styles.statusBadge} ${status === 'ACTIVE' ? styles.statusActive : styles.statusClosed} ${styles.clickableBadge}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {status === 'ACTIVE' ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
      </div>
      {isOpen && (
        <div className={styles.customOptions}>
          <div 
            className={styles.customOption}
            onClick={() => { onChange('ACTIVE'); setIsOpen(false); }}
          >
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>ĐANG MỞ</span>
          </div>
          <div 
            className={styles.customOption}
            onClick={() => { onChange('CLOSED'); setIsOpen(false); }}
          >
            <span className={`${styles.statusBadge} ${styles.statusClosed}`}>ĐÃ ĐÓNG</span>
          </div>
        </div>
      )}
    </div>
  );
};

const formatSalaryDisplay = (salaryStr: string) => {
  if (!salaryStr || salaryStr === 'Thỏa thuận') return 'Thỏa thuận';
  if (salaryStr.includes('-')) {
    const parts = salaryStr.split('-').map(s => s.trim());
    const min = Number(parts[0]);
    const max = Number(parts[1]);
    if (!isNaN(min) && !isNaN(max)) {
      return `${Intl.NumberFormat('vi-VN').format(min)} - ${Intl.NumberFormat('vi-VN').format(max)}`;
    }
  } else {
    const val = Number(salaryStr);
    if (!isNaN(val)) return Intl.NumberFormat('vi-VN').format(val);
  }
  return salaryStr;
};

export const Jobs: React.FC = () => {
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<EmployerJobListDTO[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // New states for Delete and Toast
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Filters
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStores = async () => {
    try {
      const data = await getEmployerStores();
      setStores(data?.stores || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const storeIdParam = selectedStoreId ? parseInt(selectedStoreId) : undefined;
      const statusParam = selectedStatus ? selectedStatus : undefined;
      const data = await getEmployerJobs(page, 10, storeIdParam, statusParam);
      setJobs(data?.content || []);
      setTotalJobs(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [page, selectedStoreId, selectedStatus]);

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
  const closedJobs = jobs.filter(j => j.status === 'CLOSED' || j.status === 'EXPIRED').length;

  const formatEmploymentType = (type: string) => {
    switch (type) {
      case 'PART_TIME': return 'Bán thời gian';
      case 'FULL_TIME': return 'Toàn thời gian';
      default: return type;
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await updateJobStatus(jobId, newStatus);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchJobs();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi cập nhật trạng thái', 'error');
      fetchJobs(); // reload original status
    }
  };

  const confirmDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await deleteEmployerJob(deletingJobId);
      showToast('Đã xóa tin tuyển dụng', 'success');
      setDeletingJobId(null);
      fetchJobs();
    } catch (error: any) {
      setDeletingJobId(null);
      showToast(error.message || 'Không thể xóa tin tuyển dụng này', 'error');
    }
  };

  return (
    <div className={styles.jobsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tin tuyển dụng</h1>
          <p className={styles.subtitle}>Quản lý các tin tuyển dụng đang đăng của bạn.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => setIsCreatingJob(true)}>
            <Plus size={18} /> Tạo job mới
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#ECFDF5', color: '#00B14F' }}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng số job</div>
            <div className={styles.statValue}>{totalJobs}</div>
            <div className={styles.statSub}>Tất cả tin tuyển dụng</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <PlayCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đang hoạt động</div>
            <div className={styles.statValue}>{activeJobs}</div>
            <div className={styles.statSub}>Tin đang được public</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
            <StopCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đã đóng / Hết hạn</div>
            <div className={styles.statValue}>{closedJobs}</div>
            <div className={styles.statSub}>Tin đã dừng tuyển</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Tìm kiếm job theo tiêu đề..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className={styles.filtersGroup}>
            <select 
              className={styles.select} 
              value={selectedStoreId} 
              onChange={e => { setSelectedStoreId(e.target.value); setPage(0); }}
            >
              <option value="">Tất cả store</option>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>{store.name}</option>
              ))}
            </select>
            <select 
              className={styles.select}
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setPage(0); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Đã đóng</option>
              <option value="EXPIRED">Đã hết hạn</option>
            </select>
          </div>
        </div>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>JOB</th>
              <th>STORE</th>
              <th>LƯƠNG</th>
              <th>DANH MỤC</th>
              <th>CA LÀM</th>
              <th style={{textAlign: 'center'}}>ỨNG TUYỂN</th>
              <th>HẠN NỘP</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 0 }}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <Briefcase size={40} />
                    </div>
                    <div className={styles.emptyStateTitle}>Chưa có tin tuyển dụng nào</div>
                    <div className={styles.emptyStateDesc}>Hãy tạo tin tuyển dụng đầu tiên của bạn để thu hút nhân tài.</div>
                  </div>
                </td>
              </tr>
            ) : jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className={styles.jobInfo}>
                    <img src={job.logo || 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png'} alt="logo" className={styles.jobLogo} />
                    <div>
                      <div className={styles.jobTitle}>{job.title}</div>
                      <div className={styles.jobId}>ID: {job.id} • Đăng: {job.posted}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.storeInfoText}>
                    <div className={styles.storeName} title={job.store}>{job.store}</div>
                    <div className={styles.storeAddress} title={job.address}>
                      <MapPin size={12} style={{ flexShrink: 0 }} /> {job.address}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.salaryText}>{formatSalaryDisplay(job.salary)} VND/giờ</div>
                </td>
                <td>
                  <div className={styles.tags}>
                    {job.categoriesList && job.categoriesList.length > 0 ? (
                      <>
                        {job.categoriesList.slice(0, 2).map((cat, idx) => (
                          <span key={`cat-${idx}`} className={styles.tagCategory}>{cat}</span>
                        ))}
                        {job.categoriesList.length > 2 && (
                          <span className={styles.tagCategoryPlus}>+{job.categoriesList.length - 2}</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.tagCategory}>{formatEmploymentType(job.type)}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.tags}>
                    {job.shiftsList && job.shiftsList.length > 0 ? (
                      <>
                        {job.shiftsList.slice(0, 2).map((shift, idx) => (
                          <span key={`shift-${idx}`} className={styles.tagShift}>{shift}</span>
                        ))}
                        {job.shiftsList.length > 2 && (
                          <span className={styles.tagShiftPlus}>+{job.shiftsList.length - 2}</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.tagShift}>{job.shift}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.applicantCount}>
                    <span className={styles.countNumber}>{job.applicants}</span>
                    <span className={styles.countLabel}>ỨNG VIÊN</span>
                  </div>
                </td>
                <td>
                  <div className={styles.deadlineDate}>{job.deadline || 'Không thời hạn'}</div>
                  {job.daysLeft !== 'Không thời hạn' && (
                    <div className={`${styles.deadlineLeft} ${(job.daysLeft?.includes('hết hạn') || job.daysLeft?.includes('Đã đóng')) ? styles.leftDanger : styles.leftWarning}`}>
                      {job.daysLeft}
                    </div>
                  )}
                </td>
                <td>
                  {job.status === 'EXPIRED' || job.daysLeft === 'Đã hết hạn' ? (
                    <div className={`${styles.statusBadge} ${styles.statusExpired}`}>HẾT HẠN</div>
                  ) : (
                    <StatusDropdown status={job.status} onChange={(val) => handleStatusChange(job.id, val)} />
                  )}
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.btnAction} onClick={() => setSelectedJobId(job.id)}>
                      <Eye size={16} /> Xem
                    </button>
                    <button className={styles.btnIcon} onClick={() => setDeletingJobId(job.id)} style={{ color: '#DC2626' }}>
                      <Trash2 size={18} color="currentColor" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Hiển thị trang <b>{page + 1}</b> trên <b>{totalPages}</b>
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className={styles.pageBtn} 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isCreatingJob && (
        <CreateJobModal 
          onClose={() => {
            setIsCreatingJob(false);
            fetchJobs();
          }} 
        />
      )}

      {selectedJobId && (
        <JobDetailDrawer 
          jobId={selectedJobId} 
          onClose={() => {
            setSelectedJobId(null);
            fetchJobs();
          }} 
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingJobId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <AlertCircle size={32} />
            </div>
            <h3 className={styles.modalTitle}>Xóa tin tuyển dụng</h3>
            <p className={styles.modalDesc}>
              Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Hành động này không thể hoàn tác.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setDeletingJobId(null)}>Hủy bỏ</button>
              <button className={styles.btnDelete} onClick={confirmDeleteJob}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
