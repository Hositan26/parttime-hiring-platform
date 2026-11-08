import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { PhoneCall, MapPin, Clock, Banknote, Users, CalendarDays, User, ArrowLeft, X, Send, ShieldCheck, Heart, Share2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getJobById, type JobDetail as JobDetailType } from '../../services/job.service';
import { applyForJob } from '../../services/application.service';
import { apiBase, apiFetch } from '../../services/apiClient';
import { useAuth } from '../../context/authContext';
import styles from './JobDetail.module.css';
import { ReportJob } from './ReportJob';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');

  const handleOpenModal = () => {
    if (!user) {
      navigate('/login?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
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

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setSavingJob(true);
    setSaveFeedback('');
    try {
      const response = await apiFetch(`${apiBase}/users/saved-jobs/${id}`, { method: 'PUT' });
      if (!response.ok) throw new Error((await response.json()).message || 'Không thể lưu việc.');
      setSaved(true);
      setSaveFeedback('Đã lưu công việc thành công!');
      setTimeout(() => setSaveFeedback(''), 3000);
    } catch (failure) {
      setSaveFeedback(failure instanceof Error ? failure.message : 'Không thể lưu việc.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!/^\+?[0-9]{9,15}$/.test(phone) || note.length > 2000) {
      setErrorMsg('Số điện thoại cần 9–15 chữ số; ghi chú tối đa 2000 ký tự.');
      return;
    }
    
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
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-gray)' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
          <p>Đang tải thông tin chi tiết công việc...</p>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2>Không tìm thấy công việc!</h2>
          <p style={{ color: 'var(--text-gray)', margin: '8px 0 24px' }}>Công việc này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
          <Link to="/jobs" className="btn-primary">Quay lại danh sách việc làm</Link>
        </div>
      </MainLayout>
    );
  }

  const isClosedOrExpired = job.status === 'EXPIRED' || job.status === 'CLOSED' || job.status === 'PAUSED';

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link to="/jobs" className={styles.breadcrumb}>
            <ArrowLeft size={16} /> Quay lại danh sách việc làm
          </Link>
          <ReportJob jobId={Number(id)} />
        </div>

        {saveFeedback && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '16px', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <span>{saveFeedback}</span>
          </div>
        )}

        <div className={styles.mainLayout}>
          {/* Cột trái (Nội dung chính) */}
          <div className={styles.leftCol}>
            {/* Header */}
            <div className={styles.headerCard}>
              <div className={styles.tags}>
                <span className={`${styles.tag} ${styles.status} ${isClosedOrExpired ? styles.statusInactive : ''}`}>
                  {job.status === 'EXPIRED' ? 'HẾT HẠN' : job.status === 'CLOSED' ? 'ĐÃ ĐÓNG' : job.status === 'PAUSED' ? 'ĐÃ TẠM DỪNG' : 'ĐANG TUYỂN'}
                </span>
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
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <button 
                  className={`${styles.applyBtn} ${isClosedOrExpired ? styles.applyBtnDisabled : ''}`} 
                  onClick={handleOpenModal}
                  disabled={isClosedOrExpired}
                >
                  {isClosedOrExpired ? 'Tin đã ngừng nhận đơn' : 'Ứng tuyển ngay'}
                </button>
                <button 
                  type="button"
                  className="btn-outline"
                  onClick={handleSaveJob}
                  disabled={savingJob || saved}
                  style={{ borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem' }}
                >
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} color={saved ? '#EF4444' : 'currentColor'} />
                  <span>{saved ? 'Đã lưu việc' : 'Lưu tin này'}</span>
                </button>
              </div>
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
                  <p className={styles.infoLabel}>Số lượng cần tuyển</p>
                  <p className={styles.infoValue}>{job.headcount} người</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.purple}`}><CalendarDays size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Độ tuổi yêu cầu</p>
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
                  <p className={styles.infoLabel}>Ngày đăng tin</p>
                  <p className={styles.infoValue}>{job.postedDate || 'N/A'}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div className={`${styles.infoIcon} ${styles.red}`}><Clock size={20} /></div>
                <div>
                  <p className={styles.infoLabel}>Hạn nộp hồ sơ</p>
                  <p className={styles.infoValue}>{job.expiredDate || 'Không thời hạn'}</p>
                </div>
              </div>
            </div>

            {/* Chi tiết công việc */}
            <div className={styles.contentCard}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Mô tả công việc</h2>
                <div className={styles.sectionContent} style={{ whiteSpace: 'pre-wrap' }}>
                  {job.description || 'Không có mô tả chi tiết.'}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Yêu cầu ứng viên</h2>
                <div className={styles.sectionContent} style={{ whiteSpace: 'pre-wrap' }}>
                  {job.requirements || 'Không có yêu cầu cụ thể.'}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Quyền lợi</h2>
                <div className={styles.sectionContent} style={{ whiteSpace: 'pre-wrap' }}>
                  {job.benefits || 'Theo quy định và thỏa thuận với cửa hàng.'}
                </div>
              </div>

              <div className={styles.section} style={{ marginBottom: 0 }}>
                <h2 className={styles.sectionTitle}>Đánh giá về cửa hàng</h2>
                <div className={styles.sectionContent} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-gray)' }}>
                  * Chỉ những nhân viên đã từng làm việc tại cửa hàng này mới có thể viết đánh giá để đảm bảo tính khách quan.
                </div>
                <div style={{ marginTop: '16px' }}>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Chưa có đánh giá nào cho cửa hàng này.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải (Sidebar) */}
          <div className={styles.sidebar}>
            <a href={`tel:${job.phoneContact || ''}`} className={styles.contactBlock} style={{ textDecoration: 'none' }}>
              <PhoneCall size={24} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9 }}>Liên hệ trực tiếp</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{job.phoneContact || 'Chưa cập nhật'}</div>
              </div>
            </a>

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
                  <img 
                    src={job.images[0]} 
                    alt="Ảnh công việc" 
                    className={styles.mainImage}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {job.images.length > 1 && (
                    <div className={styles.thumbGrid}>
                      {job.images.slice(1, 4).map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt="Ảnh thumb" 
                          className={styles.thumbImage} 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '120px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                  Chưa có ảnh giới thiệu
                </div>
              )}
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>ĐỊA ĐIỂM LÀM VIỆC</h3>
              <div className={styles.locationBox}>
                <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{job.storeName}</div>
                  <div style={{ lineHeight: '1.4', fontSize: '0.875rem', color: 'var(--text-gray)' }}>{job.fullAddress}</div>
                </div>
              </div>
              {job.fullAddress && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapContainer}
                >
                  <iframe
                    title="Bản đồ địa điểm"
                    width="100%"
                    height="140"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '8px', pointerEvents: 'none' }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(job.fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                  ></iframe>
                  <div className={styles.mapOverlay}>
                    <span>Mở Google Maps</span>
                  </div>
                </a>
              )}
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>CA LÀM VIỆC</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {job.shifts && job.shifts.length > 0 ? job.shifts.map((s, idx) => (
                  <div key={idx} className={styles.shiftItem}>
                    <div className={styles.shiftName}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div> 
                      {s}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có thông tin ca làm</p>
                )}
              </div>
            </div>

            <div className={styles.shareBox}>
              <button 
                type="button" 
                className={styles.shareBtn}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã sao chép liên kết công việc vào khay nhớ tạm!');
                }}
              >
                <Share2 size={16} /> Chia sẻ công việc này
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
            <button className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label="Đóng"><X size={20} /></button>
            <h2 className={styles.modalTitle}>Ứng tuyển công việc</h2>
            <p className={styles.modalSubtitle}>{job.title} — {job.storeName}</p>
            
            <form onSubmit={handleApply}>
              <div className={styles.formGroup}>
                <label>Số điện thoại liên hệ <span style={{ color: 'var(--danger)' }}>*</span></label>
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
                <div className={styles.helperText}>Số điện thoại để nhà tuyển dụng có thể gọi hoặc nhắn tin trao đổi với bạn</div>
              </div>

              <div className={styles.formGroup}>
                <label>Ghi chú gửi kèm (tùy chọn)</label>
                <div className={styles.textareaWrapper}>
                  <textarea 
                    className={styles.textarea} 
                    value={note}
                    maxLength={2000}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Em có thể làm ca tối thứ 2-4-6 và cả ngày cuối tuần..." 
                  />
                </div>
                <div className={styles.helperText}>Giới thiệu ngắn gọn hoặc ghi chú thời gian rảnh của bạn (tối đa 2000 ký tự)</div>
              </div>

              <div className={styles.securityBox}>
                <ShieldCheck size={24} className={styles.securityIcon} />
                <div>
                  <div className={styles.securityTitle}>Thông tin của bạn được bảo vệ</div>
                  <div className={styles.securityText}>Hồ sơ và CV của bạn chỉ được chia sẻ với nhà tuyển dụng của tin này. Bạn có thể rút đơn bất cứ lúc nào.</div>
                </div>
              </div>

              {errorMsg && (
                <div className={styles.errorMessage} role="alert">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className={styles.successMessage} role="status">
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={submitting}>Hủy</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  <Send size={16} /> {submitting ? 'Đang gửi...' : 'Xác nhận nộp đơn'}
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
