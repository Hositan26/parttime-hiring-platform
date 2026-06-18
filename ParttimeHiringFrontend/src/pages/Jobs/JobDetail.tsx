import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { PhoneCall, MapPin, Clock, Banknote, Users, CalendarDays, User, ArrowLeft, X, Send, ShieldCheck } from 'lucide-react';
import { getJobById, type JobDetail as JobDetailType } from '../../services/job.service';
import { applyForJob } from '../../services/application.service';
import styles from './JobDetail.module.css';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenModal = () => {
    setSuccessMsg('');
    setErrorMsg('');
    setShowModal(true);
  };

  useEffect(() => {
    if (id) {
      getJobById(id)
        .then(data => {
          setJob(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      await applyForJob({
        jobPostId: Number(id),
        contactPhone: phone,
        note: note
      });
      setSuccessMsg('Tuyệt vời! Đã gửi đơn ứng tuyển thành công.');
      setTimeout(() => setShowModal(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <MainLayout><div style={{ padding: '50px', textAlign: 'center' }}>Đang tải chi tiết công việc...</div></MainLayout>;
  }

  if (!job) {
    return <MainLayout><div style={{ padding: '50px', textAlign: 'center' }}>Không tìm thấy công việc!</div></MainLayout>;
  }

  

  return (
    <MainLayout>
      <div className={styles.container}>
        <Link to="/jobs" className={styles.breadcrumb}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>

        <div className={styles.mainLayout}>
          {/* Cột trái (Nội dung chính) */}
          <div className={styles.leftCol}>
            {/* Header */}
            <div className={styles.headerCard}>
              <div className={styles.tags}>
                <span className={`${styles.tag} ${styles.status}`}>Đang tuyển</span>
                {job.categories && job.categories.map((cat, index) => (
                  <span key={index} className={`${styles.tag} ${styles.category}`}>
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className={styles.title}>{job.title}</h1>
              <div className={styles.storeInfo}>
                <span className={styles.storeName}>
                  <MapPin size={16} /> {job.storeName}
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.companyName}>
                  <Users size={16} /> {job.company}
                </span>
              </div>
              <button className={styles.applyBtn} onClick={handleOpenModal}>
                Ứng tuyển ngay
              </button>
            </div>

            {/* Thông số nhanh */}
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.green}`}><Banknote size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Mức lương</p>
                  <p className={styles.infoValue}>{job.wage}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.blue}`}><Users size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Số lượng</p>
                  <p className={styles.infoValue}>{job.headcount} người</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.purple}`}><CalendarDays size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Độ tuổi</p>
                  <p className={styles.infoValue}>{job.ageRange}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.pink}`}><User size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Giới tính</p>
                  <p className={styles.infoValue}>{job.gender}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.orange}`}><Clock size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Ngày đăng</p>
                  <p className={styles.infoValue}>{job.postedDate || 'N/A'}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.red}`}><Clock size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Ngày hết hạn</p>
                  <p className={styles.infoValue}>{job.expiredDate || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Chi tiết công việc */}
            <div className={styles.contentCard}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Mô tả công việc</h2>
                <div className={styles.sectionContent}>
                  {job.description || 'Không có mô tả chi tiết.'}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Yêu cầu ứng viên</h2>
                <div className={styles.sectionContent}>
                  {job.requirements || 'Không có yêu cầu cụ thể.'}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quyền lợi</h2>
                <div className={styles.sectionContent}>
                  {job.benefits || 'Theo quy định của cửa hàng.'}
                </div>
              </div>

              <div className={styles.section} style={{ marginBottom: 0 }}>
                <h2 className={styles.sectionTitle}>Đánh giá & Bình luận về cửa hàng</h2>
                <div className={styles.sectionContent} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic' }}>
                  * Chỉ những người đã làm việc tại cửa hàng này trong job post này mới có thể đánh giá.
                </div>
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px', color: '#0f172a' }}>Các đánh giá gần đây</h4>
                  <p style={{ color: '#64748b' }}>Chưa có đánh giá nào cho cửa hàng này.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải (Sidebar) */}
          <div className={styles.sidebar}>
            <button className={styles.contactBlock}>
              <PhoneCall size={24} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Gọi điện ngay</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{job.phoneContact || '0900 000 000'}</div>
              </div>
            </button>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>NHÀ TUYỂN DỤNG</h3>
              <div className={styles.employerBox}>
                <div className={styles.employerLogo}>{job.company.charAt(0).toUpperCase()}</div>
                <div>
                  <div className={styles.employerName}>{job.company}</div>
                  <div className={styles.employerType}>Đơn vị tuyển dụng</div>
                </div>
              </div>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>HÌNH ẢNH CÔNG VIỆC</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{job.images ? job.images.length : 0} ảnh</p>
              {job.images && job.images.length > 0 ? (
                <div className={styles.imageGrid}>
                  <img src={job.images[0]} alt="Job main" className={styles.mainImage} />
                  {job.images.length > 1 && (
                    <div className={styles.thumbGrid}>
                      {job.images.slice(1, 4).map((img, idx) => (
                        <img key={idx} src={img} alt="thumb" className={styles.thumbImage} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '150px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Không có ảnh
                </div>
              )}
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>ĐỊA ĐIỂM LÀM VIỆC</h3>
              <div className={styles.locationBox}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{job.storeName}</div>
                  <div style={{ lineHeight: '1.4' }}>{job.fullAddress}</div>
                </div>
              </div>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapContainer}
              >
                <iframe
                  width="100%"
                  height="150"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '8px', pointerEvents: 'none' }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(job.fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
                <div className={styles.mapOverlay}>
                  <span>Mở Google Maps</span>
                </div>
              </a>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>THỜI GIAN & CA LÀM</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {job.shifts && job.shifts.length > 0 ? job.shifts.map((s, idx) => (
                  <div key={idx} className={styles.shiftItem}>
                    <div className={styles.shiftName}><div style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981'}}></div> {s}</div>
                  </div>
                )) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có thông tin ca làm</p>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '16px' }}>
                * Vui lòng liên hệ nhà tuyển dụng để xác nhận chi tiết thời gian làm việc.
              </p>
            </div>

            <div className={styles.shareBox}>
              <button className={styles.shareBtn}>
                <Send size={16} /> Chia sẻ công việc này
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ứng tuyển */}
      {showModal && createPortal(
        <div className={styles.modalOverlay} onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
            <h2 className={styles.modalTitle}>Ứng tuyển công việc</h2>
            <p className={styles.modalSubtitle}>{job.title}</p>
            
            <form onSubmit={handleApply}>
              <div className={styles.formGroup}>
                <label>Số điện thoại liên hệ</label>
                <div className={styles.inputWrapper}>
                  <PhoneCall size={18} className={styles.inputIcon} />
                  <input 
                    type="tel" 
                    className={styles.input} 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0914 768 239" 
                    required 
                  />
                </div>
                <div className={styles.helperText}>Số điện thoại để nhà tuyển dụng liên hệ với bạn</div>
              </div>

              <div className={styles.formGroup}>
                <label>Ghi chú (không bắt buộc)</label>
                <div className={styles.textareaWrapper}>
                  <textarea 
                    className={styles.textarea} 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Em có thể làm ca tối và cuối tuần." 
                  />
                </div>
                <div className={styles.helperText}>Chia sẻ thêm thông tin về bạn (nếu có)</div>
              </div>

              <div className={styles.securityBox}>
                <ShieldCheck size={24} className={styles.securityIcon} />
                <div>
                  <div className={styles.securityTitle}>Thông tin của bạn được bảo mật</div>
                  <div className={styles.securityText}>Nhà tuyển dụng chỉ xem thông tin cần thiết cho việc tuyển dụng.</div>
                </div>
              </div>

              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
              {successMsg && <div className={styles.successMessage}>{successMsg}</div>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={submitting}>Hủy</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  <Send size={16} /> {submitting ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </MainLayout>
  );
};
