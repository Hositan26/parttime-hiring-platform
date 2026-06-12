import React, { useState, useRef } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import styles from './VerifyBusiness.module.css';
import {
  ShieldCheck, Building2, Phone, Globe, Mail, MapPin,
  FileText, Link as LinkIcon, Send, CheckCircle2, Lock,
  FileCheck2, Clock, AlertCircle, HeadphonesIcon, Info,
  Edit, Check, ArrowRight
} from 'lucide-react';

export const VerifyBusiness: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxCode: '',
    licenseLink: '',
    storeImageLink: '',
    storeVideoLink: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt] = useState(new Date());
  const topRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = () => {
    if (!formData.email) return alert('Vui lòng nhập email công ty trước!');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (formData.otp.length < 6) return alert('Vui lòng nhập đủ 6 ký tự mã OTP');
    setOtpVerified(true);
  };

  const handleSubmit = () => {
    if (!otpVerified) return alert('Vui lòng xác minh email trước khi gửi hồ sơ');
    setIsSubmitted(true);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderForm = () => (
    <div className={styles.mainCard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <ShieldCheck size={28} />
        </div>
        <div className={styles.headerText}>
          <h2>Xác minh doanh nghiệp</h2>
          <p>Hoàn tất hồ sơ để mở khóa chức năng đăng tuyển và tăng độ tin cậy với ứng viên.</p>
        </div>
      </div>

      {/* 1. Thông tin doanh nghiệp */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Thông tin doanh nghiệp</h3>
        <div className={styles.grid2}>
          <div className={styles.inputGroup}>
            <label>Tên công ty <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <Building2 size={18} className={styles.inputIcon} />
              <input type="text" name="companyName" className={styles.input}
                placeholder="Ví dụ: Obt - Milktea & Coffee"
                value={formData.companyName} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Email công ty <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input type="email" name="email" className={styles.input}
                placeholder="contact@obtcoffee.vn"
                value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Số điện thoại <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input type="text" name="phone" className={styles.input}
                placeholder="0914 768 239"
                value={formData.phone} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Địa chỉ công ty <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.inputIcon} />
              <input type="text" name="address" className={styles.input}
                placeholder="35 Cao Thắng, Hải Châu, Đà Nẵng"
                value={formData.address} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Website</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" name="website" className={styles.input}
                placeholder="https://www.obtcoffee.vn"
                value={formData.website} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Mã số thuế <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <FileText size={18} className={styles.inputIcon} />
              <input type="text" name="taxCode" className={styles.input}
                placeholder="0402045678"
                value={formData.taxCode} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hồ sơ xác minh */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>2. Hồ sơ xác minh</h3>

        <div className={styles.fileRow}>
          <div className={styles.fileLabel}>
            <FileText size={18} color="#10b981" />
            Giấy phép kinh doanh <span className={styles.required}>*</span>
          </div>
          <div className={styles.fileInputWrapper}>
            <LinkIcon size={18} className={styles.inputIcon} />
            <input type="text" name="licenseLink" className={styles.input}
              placeholder="https://drive.google.com/file/d/1AbcDEF..."
              value={formData.licenseLink} onChange={handleChange} />
          </div>
          <button className={styles.checkLinkBtn}>
            <LinkIcon size={15} /> Kiểm tra link
          </button>
        </div>

        <div className={styles.fileRow}>
          <div className={styles.fileLabel}>
            <Building2 size={18} color="#10b981" />
            Ảnh cửa hàng / văn phòng <span className={styles.required}>*</span>
          </div>
          <div className={styles.fileInputWrapper}>
            <LinkIcon size={18} className={styles.inputIcon} />
            <input type="text" name="storeImageLink" className={styles.input}
              placeholder="https://drive.google.com/drive/folders/1Xyz..."
              value={formData.storeImageLink} onChange={handleChange} />
          </div>
          <button className={styles.checkLinkBtn}>
            <LinkIcon size={15} /> Kiểm tra link
          </button>
        </div>

        <div className={styles.fileRow}>
          <div className={styles.fileLabel}>
            <FileText size={18} color="#10b981" />
            Video cửa hàng / văn phòng
          </div>
          <div className={styles.fileInputWrapper}>
            <LinkIcon size={18} className={styles.inputIcon} />
            <input type="text" name="storeVideoLink" className={styles.input}
              placeholder="https://drive.google.com/file/d/1Video123..."
              value={formData.storeVideoLink} onChange={handleChange} />
          </div>
          <button className={styles.checkLinkBtn}>
            <LinkIcon size={15} /> Kiểm tra link
          </button>
        </div>

        <p className={styles.helperText}>
          <Info size={14} /> Vui lòng đảm bảo link Google Drive ở chế độ "Bất kỳ ai có liên kết đều có thể xem".
        </p>
      </div>

      {/* 3. Xác minh email */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>3. Xác minh email bằng OTP</h3>
        <div className={styles.otpRow}>
          {!otpSent ? (
            <button className={styles.sendOtpBtn} onClick={handleSendOtp}>
              <Send size={16} /> Gửi OTP đến email
            </button>
          ) : (
            <button className={`${styles.sendOtpBtn} ${styles.sent}`} disabled>
              <CheckCircle2 size={16} /> Email đã được gửi OTP
            </button>
          )}

          <div className={styles.otpInputs}>
            <input
              type="text" maxLength={6} name="otp"
              className={styles.input}
              style={{
                width: '140px', letterSpacing: '10px', textAlign: 'center',
                fontWeight: 800, fontSize: '18px', padding: '12px 14px'
              }}
              placeholder="• • • • • •"
              value={formData.otp} onChange={handleChange}
            />
          </div>

          <button className={styles.confirmOtpBtn}
            onClick={handleVerifyOtp} disabled={otpVerified}>
            Xác nhận OTP
          </button>
        </div>

        {otpVerified && (
          <div className={styles.successBanner}>
            <CheckCircle2 size={20} />
            Xác nhận thành công! Email doanh nghiệp đã được xác minh.
          </div>
        )}
      </div>

      {/* Submit */}
      <div className={styles.submitAction}>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          <Send size={18} /> Gửi hồ sơ xác minh
        </button>
        <span className={styles.submitHint}>
          <Lock size={14} /> Sau khi gửi, hồ sơ sẽ được admin kiểm tra trong vòng 24h.
        </span>
      </div>

      <div className={styles.warningBox}>
        <AlertCircle size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>📌 Lưu ý quan trọng</strong>
          <span>Sau khi gửi hồ sơ, bạn không thể chỉnh sửa thông tin. Nếu cần thay đổi, vui lòng liên hệ admin.</span>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className={styles.mainCard}>
      {/* Success Banner */}
      <div className={styles.successMainCard}>
        <div className={styles.successIconLarge}>
          <Check size={32} strokeWidth={3} />
        </div>
        <div>
          <h2>Hồ sơ xác minh đã được gửi thành công!</h2>
          <p>Cảm ơn bạn đã hoàn tất thông tin. Chúng tôi sẽ kiểm tra và phản hồi trong vòng 24h.</p>
        </div>
      </div>

      {/* 1. Read-only Info */}
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.sectionTitle}>1. Thông tin doanh nghiệp</h3>
          <button className={styles.editBtn}><Edit size={14} /> Chỉnh sửa</button>
        </div>
        <div className={styles.grid2}>
          <div className={styles.inputGroup}>
            <label><Building2 size={14} /> Tên công ty</label>
            <div className={styles.infoReadonly}>{formData.companyName || 'Obt - Milktea & Coffee'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label><Mail size={14} /> Email công ty</label>
            <div className={styles.infoReadonly}>{formData.email || 'contact@obtcoffee.vn'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label><Phone size={14} /> Số điện thoại</label>
            <div className={styles.infoReadonly}>{formData.phone || '0914 768 239'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label><MapPin size={14} /> Địa chỉ công ty</label>
            <div className={styles.infoReadonly}>{formData.address || '35 Cao Thắng, Hải Châu, Đà Nẵng'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label><Globe size={14} /> Website</label>
            <div className={styles.infoReadonly}>{formData.website || 'https://www.obtcoffee.vn'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label><FileText size={14} /> Mã số thuế</label>
            <div className={styles.infoReadonly}>{formData.taxCode || '0402045678'}</div>
          </div>
        </div>
      </div>

      {/* 2. Links read-only */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>2. Hồ sơ xác minh</h3>
        <div className={styles.fileRow}>
          <div className={styles.fileLabel}><FileText size={18} color="#10b981" /> Giấy phép kinh doanh</div>
          <div className={styles.fileInputWrapper}>
            <span style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
              {formData.licenseLink || 'https://drive.google.com/file/d/1AbcDEF...'}
            </span>
          </div>
          <button className={styles.checkedBtn}><CheckCircle2 size={14} /> Đã kiểm tra</button>
        </div>
        <div className={styles.fileRow}>
          <div className={styles.fileLabel}><Building2 size={18} color="#10b981" /> Ảnh cửa hàng / văn phòng</div>
          <div className={styles.fileInputWrapper}>
            <span style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
              {formData.storeImageLink || 'https://drive.google.com/drive/folders/1Xyz...'}
            </span>
          </div>
          <button className={styles.checkedBtn}><CheckCircle2 size={14} /> Đã kiểm tra</button>
        </div>
        <div className={styles.fileRow}>
          <div className={styles.fileLabel}><FileText size={18} color="#10b981" /> Video cửa hàng / văn phòng</div>
          <div className={styles.fileInputWrapper}>
            <span style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
              {formData.storeVideoLink || 'https://drive.google.com/file/d/1Video123...'}
            </span>
          </div>
          <button className={styles.checkedBtn}><CheckCircle2 size={14} /> Đã kiểm tra</button>
        </div>
      </div>

      {/* 3. Email verification status */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>3. Xác minh email bằng OTP</h3>
        <div className={styles.grid2}>
          <div className={styles.inputGroup}>
            <label><Mail size={14} /> Email công ty</label>
            <div className={styles.infoReadonly}>{formData.email || 'contact@obtcoffee.vn'}</div>
          </div>
          <div className={styles.inputGroup}>
            <label>Trạng thái xác minh</label>
            <div style={{
              color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center',
              gap: '8px', fontSize: '14px', marginTop: '4px',
              padding: '10px 14px', background: 'rgba(16, 185, 129, 0.06)',
              borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircle2 size={18} /> Email đã được xác minh
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Xác minh lúc</label>
            <div className={styles.infoReadonly}>
              {submittedAt.toLocaleDateString('vi-VN')} {submittedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Status tracking */}
      <div className={styles.statusCard}>
        <h3 className={styles.sectionTitle} style={{ color: '#b45309' }}>4. Trạng thái hồ sơ</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <label>Trạng thái hiện tại</label>
            <div className={styles.statusBadge}>
              <Clock size={16} /> PENDING - Chờ duyệt
            </div>
          </div>
          <div className={styles.statusItem}>
            <label>Ngày gửi hồ sơ</label>
            <div className={styles.statusValue}>
              <Clock size={16} color="#92400e" />
              {submittedAt.toLocaleDateString('vi-VN')} {submittedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className={styles.statusItem}>
            <label>Dự kiến phản hồi</label>
            <div className={styles.statusValue}>
              <Clock size={16} color="#92400e" /> Trong vòng 24h
            </div>
          </div>
        </div>
        <div className={styles.statusNotice}>
          <Info size={16} />
          Hồ sơ của bạn đang được đội ngũ của chúng tôi kiểm tra. Vui lòng chờ trong giây lát!
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className={styles.pageWrapper} ref={topRef}>
        <div className={styles.container}>
          {/* Left Column */}
          {isSubmitted ? renderSuccess() : renderForm()}

          {/* Right Column — Sidebar */}
          <div className={styles.sidebar}>
            {/* Trust Card */}
            <div className={styles.trustCard}>
              <h3><ShieldCheck size={22} /> Tăng độ tin cậy tuyển dụng</h3>
              <p>Doanh nghiệp xác minh sẽ được ưu tiên hiển thị và ứng viên tin tưởng hơn.</p>
              <div className={styles.trustFeatures}>
                <div className={styles.feature}>
                  <Clock size={26} className={styles.featureIcon} />
                  <strong>24h</strong>
                  <span>Kiểm tra thủ công</span>
                </div>
                <div className={styles.feature}>
                  <ShieldCheck size={26} className={styles.featureIcon} />
                  <strong>100%</strong>
                  <span>Bảo mật hồ sơ</span>
                </div>
                <div className={styles.feature}>
                  <CheckCircle2 size={26} className={styles.featureIcon} />
                  <strong>2 bước</strong>
                  <span>Xác minh đơn giản</span>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className={styles.guideCard}>
              <h3><FileCheck2 size={22} /> Chuẩn bị hồ sơ đúng cách</h3>
              <div className={styles.step}>
                <div className={styles.stepNumber}>01</div>
                <div className={styles.stepContent}>
                  <h4>Điền đúng thông tin doanh nghiệp</h4>
                  <p>Vui lòng cung cấp thông tin chính xác và đầy đủ để hồ sơ được duyệt nhanh hơn.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>02</div>
                <div className={styles.stepContent}>
                  <h4>Dán đúng link tài liệu Google Drive</h4>
                  <p>Đảm bảo link ở chế độ "Anyone with the link" để chúng tôi có thể truy cập.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>03</div>
                <div className={styles.stepContent}>
                  <h4>Xác thực email bằng OTP</h4>
                  <p>Sau khi gửi OTP, bạn cần nhập đúng mã để xác minh email doanh nghiệp.</p>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className={styles.tipsCard}>
              <h3><Info size={22} /> Mẹo để tránh lỗi</h3>
              <ul>
                <li>Không dùng link Drive bị giới hạn quyền truy cập.</li>
                <li>Kiểm tra mục Spam / Promotions nếu không thấy email OTP.</li>
                <li>Dùng email doanh nghiệp để tăng độ uy tín và tỷ lệ duyệt hồ sơ.</li>
              </ul>
            </div>

            {/* Support Card */}
            <div className={styles.supportCard}>
              <h3><HeadphonesIcon size={22} /> Cần hỗ trợ?</h3>
              <p>Liên hệ với chúng tôi nếu bạn gặp khó khăn trong quá trình xác minh doanh nghiệp.</p>
              <button className={styles.supportBtn}>Liên hệ hỗ trợ <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
