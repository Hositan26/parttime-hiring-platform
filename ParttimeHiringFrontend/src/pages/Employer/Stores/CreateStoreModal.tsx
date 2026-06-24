import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import styles from './CreateStoreModal.module.css';
import { createStore, type CreateStoreRequestDTO } from '../../../services/storeApi';

interface CreateStoreModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateStoreRequestDTO>({
    name: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    streetAddress: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên cửa hàng');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createStore(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Tạo cửa hàng mới</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '8px' }}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label>Tên cửa hàng <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Nhập tên cửa hàng..."
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Nhập số điện thoại liên hệ..."
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label>Tỉnh/Thành phố</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="VD: Hà Nội..."
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Quận/Huyện</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="VD: Cầu Giấy..."
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label>Phường/Xã</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="VD: Dịch Vọng..."
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số nhà, tên đường</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="VD: 123 Xuân Thủy..."
                  value={formData.streetAddress}
                  onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Mô tả</label>
              <textarea
                className={styles.textareaField}
                placeholder="Viết mô tả ngắn gọn về cửa hàng..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '-4px' }}>
              Cửa hàng mới sau khi tạo sẽ có trạng thái <strong>Chờ phê duyệt</strong>.
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'Đang lưu...' : <><Save size={16} /> Tạo cửa hàng</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
