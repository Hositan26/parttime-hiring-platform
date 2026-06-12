import React, { useState, useEffect } from 'react';
import { Plus, Store, BriefcaseBusiness, Clock, Search, MapPin, Phone, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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



  const handleDelete = async (storeId: string | number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này? Nếu cửa hàng đang có tin tuyển dụng sẽ không thể xóa.')) return;
    try {
      await deleteStore(storeId);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa cửa hàng');
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
          <h1 className={styles.title}>Cửa hàng</h1>
          <p className={styles.subtitle}>Quản lý thông tin và trạng thái của các cửa hàng đang hoạt động.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Tạo cửa hàng mới
          </button>
        </div>
      </div>

      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Store size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng số cửa hàng</div>
            <div className={styles.statValue}>{data?.totalStores || 0}</div>
            <div className={styles.statSub}>Tất cả cửa hàng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <BriefcaseBusiness size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Cửa hàng đang hoạt động</div>
            <div className={styles.statValue}>{data?.activeStores || 0}</div>
            <div className={styles.statSub}>{data?.totalStores ? ((data.activeStores / data.totalStores) * 100).toFixed(1) : 0}% tổng số cửa hàng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Chờ phê duyệt</div>
            <div className={styles.statValue}>{data?.inactiveStores || 0}</div>
            <div className={styles.statSub}>{data?.totalStores ? ((data.inactiveStores / data.totalStores) * 100).toFixed(1) : 0}% tổng số cửa hàng</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm store..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="applications">Số lượng đơn ứng tuyển</option>
            <option value="jobs">Số lượng jobs</option>
          </select>
        </div>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STORE</th>
              <th>LIÊN HỆ</th>
              <th>ĐỊA CHỈ</th>
              <th style={{textAlign: 'center'}}>JOBS</th>
              <th style={{textAlign: 'center'}}>ĐƠN ỨNG TUYỂN</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : filteredStores.length > 0 ? (
              filteredStores.map((store, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.storeInfo}>
                      <img src={store.logo} alt="logo" className={styles.storeLogo} />
                      <div>
                        <div className={styles.storeName}>{store.name}</div>
                        <div className={styles.storeId}>Store ID: ST{store.storeId?.toString()?.padStart(3, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <Phone size={14} /> {store.phone || 'Chưa cập nhật'}
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div className={styles.addressInfo}>
                      <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                      <span>{store.address}</span>
                    </div>
                  </td>
                  <td style={{textAlign: 'center', fontWeight: '600'}}>{store.jobs}</td>
                  <td style={{textAlign: 'center', fontWeight: '600'}}>{store.applications}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${store.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                        {store.status === 'ACTIVE' ? 'Đang hoạt động' : 'Chờ phê duyệt'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className={styles.actionBtn} onClick={() => navigate(`/employer/stores/${store.storeId}`)}>
                        <Eye size={18} />
                      </button>
                      {store.status !== 'INACTIVE' && (
                        <button 
                          className={`${styles.actionBtn} ${styles.danger}`} 
                          onClick={() => handleDelete(store.storeId)}
                          style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                          title="Xóa cửa hàng"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy cửa hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredStores.length >= 6 && (
          <div className={styles.pagination}>
            <div>Hiển thị 1 - {filteredStores.length} trong số {data?.totalStores} cửa hàng</div>
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
