import { usePagedResource } from '../../../services/usePagedResource';
import { apiBase } from '../../../services/apiClient';
import React, { useState } from 'react';
import { Store as StoreIcon, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, PowerOff, AlertCircle, Trash2, Check, X } from 'lucide-react';
import { updateAdminStoreStatus, updateAdminStoreApproval, deleteAdminStore, type AdminStoreResponse } from '../../../services/adminStore.service';
import styles from '../Verifications/AdminVerifications.module.css';

export const AdminStores: React.FC = () => {
  const [query, setQuery] = useState('');
  const [approved, setApproved] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');

  const [revision, setRevision] = useState(0);
  const { data, loading, error: loadError } = usePagedResource<AdminStoreResponse>(
    `${apiBase}/admin/stores?page=${page}&size=10&query=${encodeURIComponent(query)}${statusFilter !== '' ? `&isActive=${statusFilter}` : ''}${approved ? `&approved=${approved}` : ''}`,
    revision
  );
  const stores = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 0);

  const handleToggleStatus = async (storeId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const confirmMsg = currentStatus
      ? 'Bạn có chắc muốn KHÓA hoạt động cửa hàng này? Khi bị khóa, cửa hàng sẽ không thể tạo thêm tin tuyển dụng mới.'
      : 'Bạn muốn MỞ KHÓA hoạt động cửa hàng này?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateAdminStoreStatus(storeId, newStatus);
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Thao tác thất bại');
    }
  };

  const handleToggleApproval = async (store: AdminStoreResponse) => {
    const confirmMsg = store.isApproved
      ? 'Thu hồi phê duyệt địa chỉ cửa hàng này? Tin tuyển dụng công khai tại đây sẽ tạm ẩn.'
      : 'Xác nhận PHÊ DUYỆT địa chỉ cửa hàng này?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateAdminStoreApproval(store.storeId, !store.isApproved);
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Thao tác thất bại');
    }
  };

  const handleDeleteStore = async (storeId: number) => {
    if (!window.confirm('Xóa vĩnh viễn cửa hàng này? Thao tác chỉ thành công nếu cửa hàng chưa từng có tin tuyển dụng hoặc lịch sử làm việc.')) return;

    try {
      await deleteAdminStore(storeId);
      setRevision(value => value + 1);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Không xóa được cửa hàng do có ràng buộc dữ liệu');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý Chi Nhánh & Cửa Hàng</h1>
        <p className={styles.subtitle}>Kiểm duyệt địa điểm làm việc thực tế và kiểm soát quyền hoạt động của từng cơ sở.</p>
      </div>

      {loadError && (
        <div className={styles.alertBanner} role="alert">
          <AlertCircle size={18} />
          <span>{loadError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={event => { setQuery(event.target.value); setPage(0); }}
            placeholder="Tìm tên cửa hàng, địa chỉ..."
            className={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${statusFilter === '' ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(''); setPage(0); }}
            >
              Tất cả HĐ
            </button>
            <button
              className={`${styles.tab} ${statusFilter === true ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(true); setPage(0); }}
            >
              Đang hoạt động
            </button>
            <button
              className={`${styles.tab} ${statusFilter === false ? styles.activeTab : ''}`}
              onClick={() => { setStatusFilter(false); setPage(0); }}
            >
              Đã khóa
            </button>
          </div>

          <select
            aria-label="Phê duyệt"
            className={styles.selectDropdown}
            value={approved}
            onChange={event => { setApproved(event.target.value); setPage(0); }}
          >
            <option value="">Tất cả duyệt</option>
            <option value="false">Chờ duyệt địa chỉ</option>
            <option value="true">Đã duyệt địa chỉ</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.emptyIconWrapper}>
              <StoreIcon size={28} />
            </div>
            <p className={styles.emptyStateText}>Đang tải danh sách cửa hàng...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <StoreIcon size={32} />
            </div>
            <h2 className={styles.emptyStateTitle}>Không tìm thấy cửa hàng nào</h2>
            <p className={styles.emptyStateText}>Hãy thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc hiện tại.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên cửa hàng</th>
                    <th>Trực thuộc công ty</th>
                    <th>Địa chỉ hoạt động</th>
                    <th>SĐT Liên hệ</th>
                    <th>Phê duyệt địa chỉ</th>
                    <th>Trạng thái vận hành</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.storeId}>
                      <td className={styles.idCell}>#{store.storeId}</td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarSmall} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                            <StoreIcon size={16} />
                          </div>
                          <div>
                            <div className={styles.primaryText}>{store.storeName}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{store.companyName}</span>
                      </td>
                      <td>
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>{store.address}</span>
                      </td>
                      <td>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{store.phoneContact || '-'}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${store.isApproved ? styles.badgeSuccess : styles.badgeWarning}`}>
                          {store.isApproved ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                          <span>{store.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${store.isActive ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {store.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          <span>{store.isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${store.isApproved ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                            onClick={() => handleToggleApproval(store)}
                            title={store.isApproved ? 'Thu hồi phê duyệt địa chỉ' : 'Phê duyệt địa chỉ'}
                          >
                            {store.isApproved ? <X size={14} /> : <Check size={14} />}
                            <span>{store.isApproved ? 'Hủy duyệt' : 'Duyệt'}</span>
                          </button>

                          <button
                            disabled={!store.isApproved && !store.isActive}
                            className={`${styles.actionBtn} ${store.isActive ? styles.actionBtnDanger : styles.actionBtnPrimary}`}
                            onClick={() => handleToggleStatus(store.storeId, store.isActive)}
                            title={!store.isApproved && !store.isActive ? 'Cần duyệt địa chỉ trước khi mở hoạt động' : (store.isActive ? 'Khóa cửa hàng' : 'Mở khóa')}
                          >
                            {store.isActive ? <PowerOff size={14} /> : <CheckCircle2 size={14} />}
                            <span>{store.isActive ? 'Khóa' : 'Mở'}</span>
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDeleteStore(store.storeId)}
                            title="Xóa cửa hàng không có dữ liệu tuyển dụng"
                          >
                            <Trash2 size={14} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Trang {page + 1} / {totalPages} (Tổng số {data?.totalElements ?? stores.length} cửa hàng)
              </span>
              <div className={styles.paginationButtons}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className={styles.pageBtn}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className={styles.pageBtn}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
