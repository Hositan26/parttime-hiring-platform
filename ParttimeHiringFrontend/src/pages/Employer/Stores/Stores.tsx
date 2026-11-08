import { toggleStoreStatus } from '../../../services/storeApi';
import React, { useState, useEffect } from 'react';
import { Plus, Store, BriefcaseBusiness, Clock, Search, MapPin, Phone, Eye, ChevronLeft, ChevronRight, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEmployerStores, deleteStore, type EmployerStoreListDTO } from '../../../services/storeApi';
import styles from './Stores.module.css';
import { useNavigate } from 'react-router-dom';
import { CreateStoreModal } from './CreateStoreModal';

export const Stores: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<EmployerStoreListDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getEmployerStores(sortBy);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch stores', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const changeActivity = async (storeId: string | number) => {
    try {
      setLoading(true);
      setActionError('');
      await toggleStoreStatus(storeId);
      setActionMessage('Đã cập nhật trạng thái hoạt động của cửa hàng.');
      setTimeout(() => setActionMessage(''), 3000);
      await fetchData();
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'Không thể đổi trạng thái cửa hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId: string | number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này? Nếu cửa hàng đang có tin tuyển dụng sẽ không thể xóa.')) return;
    try {
      setActionError('');
      await deleteStore(storeId);
      setActionMessage('Đã xóa cửa hàng thành công.');
      setTimeout(() => setActionMessage(''), 3000);
      fetchData();
    } catch (error: any) {
      setActionError(error.message || 'Không thể xóa cửa hàng');
    }
  };

  const lowerSearchTerm = searchTerm.trim().toLowerCase();
  const filteredStores = data?.stores?.filter(store => {
    if (!lowerSearchTerm) return true;
    return (
      (store.name?.toLowerCase() || '').includes(lowerSearchTerm) || 
      `st${store.storeId?.toString()?.padStart(3, '0') || ''}`.toLowerCase().includes(lowerSearchTerm) ||
      (store.address?.toLowerCase() || '').includes(lowerSearchTerm)
    );
  }) || [];

  return (
    <div className={styles.storesPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cửa hàng & Chi nhánh</h1>
          <p className={styles.subtitle}>Quản lý thông tin, địa điểm và trạng thái hoạt động của từng cơ sở.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Tạo cửa hàng mới
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="status">
          <CheckCircle2 size={16} color="var(--success)" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.875rem' }} role="alert">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Store size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng số cửa hàng</div>
            <div className={styles.statValue}>{data?.totalStores || 0}</div>
            <div className={styles.statSub}>Tất cả cơ sở đã tạo</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <BriefcaseBusiness size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đang hoạt động</div>
            <div className={styles.statValue}>{data?.activeStores || 0}</div>
            <div className={styles.statSub}>{data?.totalStores ? ((data.activeStores / data.totalStores) * 100).toFixed(0) : 0}% tổng số cửa hàng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tạm ngừng / Chờ duyệt</div>
            <div className={styles.statValue}>{data?.inactiveStores || 0}</div>
            <div className={styles.statSub}>Cần kiểm tra hoặc kích hoạt</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, địa chỉ, mã ST..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="applications">Nhiều đơn ứng tuyển nhất</option>
            <option value="jobs">Nhiều tin tuyển dụng nhất</option>
          </select>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>CỬA HÀNG</th>
                <th>LIÊN HỆ</th>
                <th>ĐỊA CHỈ</th>
                <th style={{ textAlign: 'center' }}>TIN ĐĂNG</th>
                <th style={{ textAlign: 'center' }}>ĐƠN ỨNG TUYỂN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-gray)' }}>
                    Đang tải dữ liệu cửa hàng...
                  </td>
                </tr>
              ) : filteredStores.length > 0 ? (
                filteredStores.map((store, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.storeInfo}>
                        <img 
                          src={store.logo || "https://cdn-icons-png.flaticon.com/512/3268/3268832.png"} 
                          alt="logo" 
                          className={styles.storeLogo} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png";
                          }}
                        />
                        <div>
                          <div className={styles.storeName}>{store.name}</div>
                          <div className={styles.storeId}>Mã: ST{store.storeId?.toString()?.padStart(3, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactInfo}>
                        <Phone size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} /> 
                        <span>{store.phone || 'Chưa cập nhật'}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className={styles.addressInfo}>
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} /> 
                        <span>{store.address}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-dark)' }}>{store.jobs}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-dark)' }}>{store.applications}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {store.status === 'ACTIVE' ? (
                          <span className="badge-success">Đang hoạt động</span>
                        ) : store.status === 'PAUSED' ? (
                          <span className="badge-warning">Tạm ngừng</span>
                        ) : (
                          <span className="badge-neutral">Chờ duyệt</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {store.status !== 'PENDING' && (
                          <button 
                            className={styles.actionBtn} 
                            disabled={loading} 
                            onClick={() => void changeActivity(store.storeId)}
                            title={store.status === 'ACTIVE' ? 'Tạm ngừng nhận ứng tuyển' : 'Mở lại hoạt động'}
                          >
                            {store.status === 'ACTIVE' ? 'Tạm ngừng' : 'Bật lại'}
                          </button>
                        )}
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => navigate(`/employer/stores/${store.storeId}`)}
                          title="Xem chi tiết cửa hàng"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.danger}`} 
                          onClick={() => handleDelete(store.storeId)}
                          style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                          title="Xóa cửa hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-gray)' }}>
                    Không tìm thấy cửa hàng nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredStores.length >= 6 && (
          <div className={styles.pagination}>
            <div>Hiển thị {filteredStores.length} trong số {data?.totalStores || 0} cửa hàng</div>
            <div className={styles.pageControls}>
              <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {isCreating && (
        <CreateStoreModal 
          onClose={() => setIsCreating(false)} 
          onSuccess={() => {
            setIsCreating(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};
