import React, { useState, useEffect } from 'react';
import { Plus, Store, BriefcaseBusiness, PauseCircle, Search, MapPin, Phone, Eye, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEmployerStores, type EmployerStoreListDTO } from '../../../services/storeApi';
import styles from './Stores.module.css';

export const Stores: React.FC = () => {
  const [data, setData] = useState<EmployerStoreListDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
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
    fetchData();
  }, [sortBy]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className={styles.storesPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cửa hàng</h1>
          <p className={styles.subtitle}>Quản lý thông tin và trạng thái của các cửa hàng đang hoạt động.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary}>
            <Plus size={18} /> Tạo store mới
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
            <PauseCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Cửa hàng tạm ngưng</div>
            <div className={styles.statValue}>{data?.inactiveStores || 0}</div>
            <div className={styles.statSub}>{data?.totalStores ? ((data.inactiveStores / data.totalStores) * 100).toFixed(1) : 0}% tổng số cửa hàng</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Tìm kiếm store..." />
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
            ) : data?.stores && data.stores.length > 0 ? (
              data.stores.map((store, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.storeInfo}>
                      <img src={store.logo} alt="logo" className={styles.storeLogo} />
                      <div>
                        <div className={styles.storeName}>{store.name}</div>
                        <div className={styles.storeId}>Store ID: ST{store.storeId.toString().padStart(3, '0')}</div>
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
                      {store.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={styles.actionBtn}>
                        <Eye size={14} /> Chi tiết
                      </button>
                      <button className={styles.moreBtn}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Chưa có cửa hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        {data?.stores && data.stores.length >= 6 && (
          <div className={styles.pagination}>
            <div>Hiển thị 1 - {data.stores.length} trong số {data.totalStores} cửa hàng</div>
            <div className={styles.pageControls}>
              <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
