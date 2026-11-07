import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, PowerOff } from 'lucide-react';
import { getAdminStores, updateAdminStoreStatus, updateAdminStoreApproval, deleteAdminStore, type AdminStoreResponse } from '../../../services/adminStore.service';
import styles from '../Verifications/AdminVerifications.module.css'; // Reusing styles

export const AdminStores: React.FC = () => {
  const [query, setQuery] = useState('');
  const [approved, setApproved] = useState('');
  const [error, setError] = useState('');
  const [stores, setStores] = useState<AdminStoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');

  const fetchList = async (pageNum: number, status: boolean | '') => {
    try {
      setLoading(true);
      const data = await getAdminStores(status, pageNum, 10, query, approved);
      setStores(data.content || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không tải được cửa hàng');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, statusFilter);
  }, [page, statusFilter, query, approved]);

  const handleToggleStatus = async (storeId: number, currentStatus: boolean) => {
    let newStatus = !currentStatus;
    let confirmMsg = currentStatus 
        ? 'Bạn có chắc muốn KHÓA cửa hàng này? Khi bị khóa, nó sẽ không thể tạo thêm tin tuyển dụng.' 
        : 'Bạn muốn MỞ KHÓA cửa hàng này?';
        
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await updateAdminStoreStatus(storeId, newStatus);
      alert('Đã cập nhật trạng thái cửa hàng');
      fetchList(page, statusFilter);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className={`${styles.badge} ${styles.badgeSuccess}`}>
        <CheckCircle2 size={14}/> Hoạt động
      </span>
    ) : (
      <span className={`${styles.badge} ${styles.badgeDanger}`}>
        <XCircle size={14}/> Đã khóa
      </span>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Chi Nhánh / Cửa Hàng</h1>
        <p className={styles.subtitle}>Kiểm duyệt các địa điểm làm việc thực tế của doanh nghiệp.</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input type="text" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Tìm tên cửa hàng..." className={styles.searchInput} />
          </div>
          
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${statusFilter === '' ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(''); setPage(0); }}>
              Tất cả
            </button>
            <button className={`${styles.tab} ${statusFilter === true ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(true); setPage(0); }}>
              Hoạt động
            </button>
            <button className={`${styles.tab} ${statusFilter === false ? styles.activeTab : ''}`} onClick={() => { setStatusFilter(false); setPage(0); }}>
              Đã khóa
            </button>
          </div>
        </div>

        <select aria-label="Phê duyệt" className="input-base" value={approved} onChange={event => { setApproved(event.target.value); setPage(0); }}>
          <option value="">Tất cả phê duyệt</option><option value="false">Chờ duyệt</option><option value="true">Đã duyệt</option>
        </select>
        {error && <p role="alert">{error}</p>}
        {loading ? (
          <div className={styles.emptyState}>Đang tải dữ liệu...</div>
        ) : stores.length === 0 ? (
          <div className={styles.emptyState}>
            <StoreIcon size={48} className={styles.emptyIcon} />
            <p>Không có cửa hàng nào.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên cửa hàng</th>
                  <th>Trực thuộc công ty</th>
                  <th>Địa chỉ</th>
                  <th>SĐT Liên hệ</th>
                  <th>Phê duyệt</th><th>Hoạt động</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.storeId}>
                    <td>#{store.storeId}</td>
                    <td style={{ fontWeight: 600 }}>{store.storeName}</td>
                    <td>{store.companyName}</td>
                    <td>{store.address}</td>
                    <td>{store.phoneContact || '-'}</td>
                    <td><span className={store.isApproved ? 'badge-success' : 'badge-warning'}>{store.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}</span></td><td>{getStatusBadge(store.isActive)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-outline" onClick={async () => {
                        if (!window.confirm(store.isApproved ? 'Thu hồi phê duyệt cửa hàng?' : 'Duyệt địa chỉ cửa hàng này?')) return;
                        try { await updateAdminStoreApproval(store.storeId, !store.isApproved); fetchList(page, statusFilter); }
                        catch (error) { alert(error instanceof Error ? error.message : 'Thao tác thất bại'); }
                      }}>{store.isApproved ? 'Thu hồi duyệt' : 'Phê duyệt'}</button>
                      <button className="btn-outline" onClick={async () => {
                        if (!window.confirm('Xóa cửa hàng không có lịch sử tuyển dụng?')) return;
                        try { await deleteAdminStore(store.storeId); fetchList(page, statusFilter); }
                        catch (error) { alert(error instanceof Error ? error.message : 'Không xóa được'); }
                      }}>Xóa</button>
                      <button disabled={!store.isApproved && !store.isActive}
                        className={styles.actionBtn}
                        onClick={() => handleToggleStatus(store.storeId, store.isActive)}
                        style={{ color: store.isActive ? '#ef4444' : '#10b981' }}
                      >
                        {store.isActive ? <PowerOff size={16} /> : <CheckCircle2 size={16} />}
                        {store.isActive ? 'Khóa' : 'Mở Khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className={styles.pagination}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
                <ChevronLeft size={16} />
              </button>
              <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
