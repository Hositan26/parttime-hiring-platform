import React from 'react';
import { Store, Briefcase, Users, Star, CheckCircle2, Edit3, Calendar, FileDigit, Eye, RefreshCw, Save, PlayCircle } from 'lucide-react';
import styles from './Profile.module.css';

export const Profile: React.FC = () => {
  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hồ sơ Doanh nghiệp</h1>
        <p className={styles.subtitle}>Quản lý thông tin doanh nghiệp và tài khoản của bạn.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Store size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng cửa hàng</div>
            <div className={styles.statValue}>15</div>
            <div className={styles.statSub}>Đang hoạt động: 14</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Briefcase size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng tin tuyển dụng</div>
            <div className={styles.statValue}>13</div>
            <div className={styles.statSub} style={{color: '#0284C7'}}>Đang hoạt động: 11</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Tổng ứng viên</div>
            <div className={styles.statValue}>42</div>
            <div className={styles.statSub} style={{color: '#D97706'}}>Chờ xử lý: 16</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
            <Star size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Đánh giá trung bình</div>
            <div className={styles.statValue}>4.8 / 5</div>
            <div className={styles.statSub} style={{color: '#9333EA'}}>Dựa trên 32 đánh giá</div>
          </div>
        </div>
      </div>

      <div className={styles.profileBanner}>
        <div className={styles.bannerLeft}>
          <img src="https://cdn-icons-png.flaticon.com/512/3268/3268832.png" alt="Company Logo" className={styles.companyLogo} />
          <div className={styles.companyInfo}>
            <div className={styles.companyNameRow}>
              <div className={styles.companyName}>Obt - Milktea & Coffee</div>
              <div className={styles.verifiedBadge}>
                <CheckCircle2 size={14} /> Verified Employer
              </div>
            </div>
            <div className={styles.companyMeta}>
              <div className={styles.metaItem}>
                <Calendar size={14} /> Thành viên từ 05/2025
              </div>
              <div className={styles.metaItem}>
                <FileDigit size={14} /> ID doanh nghiệp: EMP0002
              </div>
            </div>
          </div>
        </div>
        <div>
          <button className={styles.btnOutline}>
            <Edit3 size={16} /> Chỉnh sửa thông tin
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Thông tin doanh nghiệp</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên công ty</label>
              <input type="text" className={styles.input} defaultValue="Obt - Milktea & Coffee" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input type="text" className={styles.input} defaultValue="obtmilktea@gmail.com" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại</label>
              <input type="text" className={styles.input} defaultValue="0914 768 239" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Website</label>
              <input type="text" className={styles.input} defaultValue="https://obtmilktea.vn" readOnly />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Địa chỉ</label>
              <input type="text" className={styles.input} defaultValue="35 Cao Thắng, Hải Châu, Đà Nẵng, Thanh Bình, Hải Châu, Đà Nẵng" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mã số thuế</label>
              <input type="text" className={styles.input} defaultValue="0402045678" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Quy mô công ty</label>
              <select className={styles.input} disabled>
                <option selected>10 - 50 nhân viên</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mã ngành nghề</label>
              <select className={styles.input} disabled>
                <option selected>Nguyễn Văn Niên</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngành nghề</label>
              <select className={styles.input} disabled>
                <option selected>F&B / Đồ uống</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên người đại diện</label>
              <input type="text" className={styles.input} defaultValue="Nguyễn Văn Nam" readOnly />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại người đại diện</label>
              <input type="text" className={styles.input} defaultValue="0914 768 239" readOnly />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Mô tả doanh nghiệp</div>
            <div className={styles.formGroup}>
              <textarea className={styles.textarea} readOnly defaultValue="Obt - Milktea & Coffee là chuỗi cửa hàng đồ uống được yêu thích tại Đà Nẵng. Chúng tôi mang đến những sản phẩm chất lượng cùng không gian hiện đại, trẻ trung. Đội ngũ của chúng tôi luôn thân thiện, năng động và không ngừng phát triển." />
              <div className={styles.charCount}>154/300</div>
            </div>
          </div>

          <div className={styles.card} style={{ flex: 1 }}>
            <div className={styles.cardTitle}>Tài liệu xác minh</div>
            <div className={styles.docsGrid}>
              {[
                { name: 'CCCD mặt trước', img: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=200' },
                { name: 'CCCD mặt sau', img: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=200' },
                { name: 'Ảnh cửa hàng', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=200' },
                { name: 'Video cửa hàng', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=200', isVideo: true },
              ].map((doc, idx) => (
                <div key={idx} className={styles.docItem}>
                  <div className={styles.docPreview}>
                    <img src={doc.img} alt={doc.name} className={styles.docImage} style={doc.isVideo ? {filter: 'brightness(0.7)'} : {}} />
                    {doc.isVideo && <div style={{position: 'absolute', color: 'white'}}><PlayCircle size={32} /></div>}
                    <div className={styles.docOverlay}>
                      <Eye size={16} /> Xem
                    </div>
                  </div>
                  <div className={styles.docName}>{doc.name}</div>
                  <div className={styles.docStatus}>
                    <CheckCircle2 size={14} /> Đã xác minh
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.cardFooter}>
              <button className={styles.btnOutline}>
                <RefreshCw size={16} /> Xác minh lại
              </button>
              <button className={styles.btnPrimary}>
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
