import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import { sendOtp } from '../../services/email.service';
import styles from './VerifyBusiness.module.css';
import {
  ShieldCheck, Store, Phone, Globe, Mail, MapPin,
  FileText, Send, CheckCircle2, Lock,
  FileCheck2, Clock, AlertCircle, HeadphonesIcon, Info,
  Check, ArrowRight, UploadCloud, X, User
} from 'lucide-react';

export const VerifyBusiness: React.FC = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    representativeName: '',
    email: '',
    phone: '',
    address: '',
    websiteFanpageUrl: '',
    taxCode: '',
    otp: ''
  });

  const [fileData, setFileData] = useState<{ [key: string]: File | null }>({
    storeFrontImage: null,
    idCardFront: null,
    idCardBack: null,
    businessLicense: null,
  });

  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Thêm state cho OTP countdown và thông báo
  const [countdown, setCountdown] = useState(0);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8088/parttime_hiring_platform/api/users/employer-verifications/my-status', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hasRequest) {
            if (data.status === 'PENDING' || data.status === 'APPROVED') {
              setIsSubmitted(true);
            }
            setVerificationStatus(data.status);
            if (data.submittedAt) {
              setSubmittedAt(new Date(data.submittedAt));
            }
          }
        }
      } catch (e) {
        console.error("Error fetching status", e);
      }
    };
    fetchStatus();
  }, []);

  // Timer cho OTP countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof fileData) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn ảnh dưới 5MB để đảm bảo tốc độ tải.');
        return;
      }

      // Giả lập tiến trình tải ảnh lên giao diện
      setFileProgress((prev) => ({ ...prev, [fieldName]: 0 }));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (progress <= 100) {
          setFileProgress((prev) => ({ ...prev, [fieldName]: progress }));
        }
        if (progress >= 100) {
          clearInterval(interval);
          setFileData((prev) => ({ ...prev, [fieldName]: file }));
          setPreviewUrls((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
        }
      }, 150);
    }
  };

  const removeFile = (fieldName: keyof typeof fileData) => {
    setFileData((prev) => ({ ...prev, [fieldName]: null }));
    setPreviewUrls((prev) => ({ ...prev, [fieldName]: '' }));
    setFileProgress((prev) => ({ ...prev, [fieldName]: 0 }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return alert('Vui lòng nhập email công ty trước!');
    
    setIsSendingOtp(true);
    try {
      await sendOtp(formData.email);
      setOtpSuccessMsg('Gửi mã OTP thành công! Vui lòng kiểm tra email (kể cả hòm thư rác).');
      setOtpSent(true);
      setCountdown(60);
      
      // Tự ẩn thông báo sau 5s
      setTimeout(() => setOtpSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(`Lỗi gửi OTP: ${err.message}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (formData.otp.length < 6) return alert('Vui lòng nhập đủ 6 ký tự mã OTP');
    setOtpVerified(true);
  };

  const handleSubmit = async () => {
    if (!otpVerified) return alert('Vui lòng xác minh email bằng OTP trước khi gửi hồ sơ');
    if (!fileData.storeFrontImage || !fileData.idCardFront || !fileData.idCardBack) {
      return alert('Vui lòng tải lên đầy đủ các tài liệu bắt buộc (Ảnh mặt tiền, CCCD mặt trước & mặt sau).');
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('storeName', formData.storeName);
      form.append('representativeName', formData.representativeName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('address', formData.address);
      form.append('otpCode', formData.otp);
      if (formData.taxCode) form.append('taxCode', formData.taxCode);
      if (formData.websiteFanpageUrl) form.append('websiteFanpageUrl', formData.websiteFanpageUrl);
      
      form.append('storeFrontImage', fileData.storeFrontImage);
      form.append('idCardFront', fileData.idCardFront);
      form.append('idCardBack', fileData.idCardBack);
      if (fileData.businessLicense) {
        form.append('businessLicense', fileData.businessLicense);
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8088/parttime_hiring_platform/api/users/employer-verifications', true);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            // Limit to 95% during upload, the last 5% is for server processing (Cloudinary upload)
            setUploadProgress(percentComplete < 100 ? percentComplete : 95);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errMsg = 'Gửi thất bại';
            try { errMsg = JSON.parse(xhr.responseText).message || errMsg; } catch(e){}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));
        xhr.send(form);
      });

      setSubmittedAt(new Date());
      setVerificationStatus('PENDING');
      setIsSubmitted(true);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDropZone = (
    label: string, 
    fieldName: keyof typeof fileData, 
    required: boolean, 
    icon: React.ReactNode, 
    hint: string
  ) => {
    const preview = previewUrls[fieldName];
    const isUploading = fileProgress[fieldName] !== undefined && fileProgress[fieldName] > 0 && fileProgress[fieldName] < 100;

    return (
      <div className={styles.fileRow}>
        <div className={styles.fileLabel}>
          {icon}
          {label} {required && <span className={styles.required}>*</span>}
        </div>
        
        {isUploading ? (
          <div className={styles.dropZoneUploading}>
             <div className={styles.uploadingHeader}>
               <span className={styles.uploadingTitle}>Đang tải ảnh lên...</span>
               <span className={styles.uploadingPercent}>{fileProgress[fieldName]}%</span>
             </div>
             <div className={styles.progressBarBg}>
               <div className={styles.progressBarFill} style={{ width: `${fileProgress[fieldName]}%` }}></div>
             </div>
          </div>
        ) : preview ? (
          <div className={styles.dropZonePreview}>
            <img src={preview} alt="Preview" className={styles.previewImage} />
            <div className={styles.previewOverlay}>
              <button className={styles.removeBtn} onClick={() => removeFile(fieldName)}>
                <X size={18} /> Xóa ảnh
              </button>
            </div>
            <div className={styles.successBadge}>
              <CheckCircle2 size={14} /> Đã tải lên thành công
            </div>
          </div>
        ) : (
          <div className={styles.dropZone}>
            <input 
              type="file" 
              accept="image/*" 
              className={styles.fileInputHidden} 
              onChange={(e) => handleFileChange(e, fieldName)}
              id={`upload-${fieldName}`}
            />
            <label htmlFor={`upload-${fieldName}`} className={styles.dropZoneLabel}>
              <UploadCloud size={28} className={styles.uploadIcon} />
              <div className={styles.uploadText}>
                <strong>Nhấn để tải ảnh lên</strong> hoặc kéo thả vào đây
              </div>
              <div className={styles.uploadHint}>{hint} (Tối đa 5MB)</div>
            </label>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <div className={styles.mainCard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <ShieldCheck size={28} />
        </div>
        <div className={styles.headerText}>
          <h2>Xác minh cửa hàng</h2>
          <p>Hoàn tất hồ sơ để mở khóa chức năng đăng tuyển và nhận Tick Xanh uy tín.</p>
        </div>
      </div>

      {/* 1. Thông tin doanh nghiệp */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Thông tin liên hệ cơ bản</h3>
        <div className={styles.grid2}>
          <div className={styles.inputGroup}>
            <label>Tên cửa hàng <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <Store size={18} className={styles.inputIcon} />
              <input type="text" name="storeName" className={styles.input}
                placeholder="Ví dụ: Cà phê The Local"
                value={formData.storeName} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Họ tên chủ cửa hàng <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input type="text" name="representativeName" className={styles.input}
                placeholder="Nguyễn Văn A"
                value={formData.representativeName} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Email liên hệ <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input type="email" name="email" className={styles.input}
                placeholder="contact@cuahang.vn"
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
          <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Địa chỉ cửa hàng <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.inputIcon} />
              <input type="text" name="address" className={styles.input}
                placeholder="35 Cao Thắng, Hải Châu, Đà Nẵng"
                value={formData.address} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hồ sơ xác minh bắt buộc */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>2. Hồ sơ định danh (Bắt buộc)</h3>
        <p className={styles.helperText} style={{ marginBottom: '20px', marginLeft: 0 }}>
          <Info size={14} /> Chụp ảnh rõ nét, không bị lóa sáng hay mất góc để được duyệt nhanh nhất.
        </p>

        {renderDropZone('Ảnh mặt tiền cửa hàng', 'storeFrontImage', true, <Store size={18} color="#10b981" />, 'Chụp rõ bảng hiệu')}
        {renderDropZone('Ảnh CCCD (Mặt trước)', 'idCardFront', true, <User size={18} color="#10b981" />, 'Thấy rõ mặt và số CCCD')}
        {renderDropZone('Ảnh CCCD (Mặt sau)', 'idCardBack', true, <User size={18} color="#10b981" />, 'Rõ nét vân tay')}
      </div>

      {/* 3. Hồ sơ bổ sung */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          3. Thông tin bổ sung 
          <span className={styles.optionalBadge}>Khuyến khích</span>
        </h3>

        {renderDropZone('Giấy phép kinh doanh', 'businessLicense', false, <FileText size={18} color="#3b82f6" />, 'Bản gốc hoặc bản sao công chứng')}

        <div className={styles.grid2} style={{ marginTop: '20px' }}>
          <div className={styles.inputGroup}>
            <label>Mã số thuế</label>
            <div className={styles.inputWrapper}>
              <FileText size={18} className={styles.inputIcon} />
              <input type="text" name="taxCode" className={styles.input}
                placeholder="Ví dụ: 0402045678"
                value={formData.taxCode} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Website / Fanpage</label>
            <div className={styles.inputWrapper}>
              <Globe size={18} className={styles.inputIcon} />
              <input type="text" name="websiteFanpageUrl" className={styles.input}
                placeholder="https://facebook.com/cuahang"
                value={formData.websiteFanpageUrl} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Xác minh email */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>4. Xác minh email bằng OTP</h3>
        
        {otpSuccessMsg && (
          <div className={styles.successBanner} style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={18} /> {otpSuccessMsg}
          </div>
        )}

        <div className={styles.otpRow}>
          {(!otpSent || countdown === 0) ? (
            <button className={styles.sendOtpBtn} onClick={handleSendOtp} disabled={isSendingOtp}>
              {isSendingOtp ? (
                <><div className={styles.spinner}></div> Đang gửi...</>
              ) : (
                <><Send size={16} /> Gửi {otpSent ? 'lại ' : ''}OTP đến email</>
              )}
            </button>
          ) : (
            <button className={`${styles.sendOtpBtn} ${styles.sent}`} disabled>
              <CheckCircle2 size={16} /> Đã gửi mã OTP ({countdown}s)
            </button>
          )}

          <div className={styles.otpInputs}>
            <input
              type="text" maxLength={6} name="otp"
              className={styles.input}
              style={{
                width: '180px', letterSpacing: '10px', textAlign: 'center',
                fontWeight: 800, fontSize: '18px', padding: '12px 14px'
              }}
              placeholder="••••••"
              value={formData.otp} onChange={handleChange}
            />
          </div>

          <button className={styles.confirmOtpBtn}
            onClick={handleVerifyOtp} disabled={otpVerified}>
            Xác nhận
          </button>
        </div>

        {otpVerified && (
          <div className={styles.successBanner}>
            <CheckCircle2 size={20} />
            Tuyệt vời! Email của bạn đã được xác minh.
          </div>
        )}
      </div>

      {/* Submit */}
      <div className={styles.submitAction}>
        {isSubmitting ? (
          <div className={styles.progressWrapper}>
            <div className={styles.progressHeader}>
              <span className={styles.progressText}>
                {uploadProgress < 100 ? 'Đang tải lên tài liệu...' : 'Đang xử lý dữ liệu...'}
              </span>
              <span className={styles.progressPercent}>{uploadProgress}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        ) : (
          <button className={styles.submitBtn} onClick={handleSubmit}>
            <CheckCircle2 size={20} /> Gửi Hồ Sơ Xác Minh
          </button>
        )}
        <div className={styles.submitHint}>
          <Lock size={14} /> Sau khi gửi, hồ sơ sẽ được admin kiểm tra trong vòng 24h.
        </div>
      </div>

      <div className={styles.warningBox}>
        <AlertCircle size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>📌 Lưu ý quan trọng</strong>
          <span>Mọi thông tin tải lên đều được mã hóa bảo mật. Nếu cần thay đổi sau khi gửi, vui lòng liên hệ admin.</span>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className={styles.mainCard}>
      <div className={styles.successMainCard}>
        <div className={styles.successIconLarge}>
          <Check size={32} strokeWidth={3} />
        </div>
        <div>
          <h2>Hồ sơ đã được gửi thành công!</h2>
          <p>Cảm ơn bạn đã hợp tác. Chúng tôi sẽ đối chiếu thông tin và phản hồi sớm nhất.</p>
        </div>
      </div>

      <div className={styles.statusCard}>
        <h3 className={styles.sectionTitle} style={{ color: '#b45309' }}>Trạng thái hiện tại</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <label>Trạng thái</label>
            <div className={styles.statusBadge}>
              <Clock size={16} /> {verificationStatus === 'APPROVED' ? 'APPROVED - Đã duyệt' : 'PENDING - Đang chờ duyệt'}
            </div>
          </div>
          <div className={styles.statusItem}>
            <label>Thời gian gửi</label>
            <div className={styles.statusValue}>
              <Clock size={16} color="#92400e" />
              {submittedAt ? `${submittedAt.toLocaleDateString('vi-VN')} ${submittedAt.toLocaleTimeString('vi-VN')}` : 'Đang tải...'}
            </div>
          </div>
        </div>
        <div className={styles.statusNotice}>
          <Info size={16} />
          Hệ thống sẽ gửi email thông báo kết quả cho bạn. Xin vui lòng chờ!
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
              <h3><ShieldCheck size={22} /> Ưu tiên tuyển dụng</h3>
              <p>Cửa hàng có tick xanh sẽ được thuật toán ưu tiên hiển thị lên trang chủ ứng viên.</p>
              <div className={styles.trustFeatures}>
                <div className={styles.feature}>
                  <Clock size={26} className={styles.featureIcon} />
                  <strong>24h</strong>
                  <span>Xét duyệt nhanh</span>
                </div>
                <div className={styles.feature}>
                  <ShieldCheck size={26} className={styles.featureIcon} />
                  <strong>100%</strong>
                  <span>Mã hóa bảo mật</span>
                </div>
                <div className={styles.feature}>
                  <CheckCircle2 size={26} className={styles.featureIcon} />
                  <strong>Tick xanh</strong>
                  <span>Hồ sơ uy tín</span>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className={styles.guideCard}>
              <h3><FileCheck2 size={22} /> Mẹo tải ảnh thành công</h3>
              <div className={styles.step}>
                <div className={styles.stepNumber}>01</div>
                <div className={styles.stepContent}>
                  <h4>Đủ ánh sáng</h4>
                  <p>Hãy đảm bảo chụp ảnh ở nơi có ánh sáng tốt, chữ không bị bóng lóa.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>02</div>
                <div className={styles.stepContent}>
                  <h4>Rõ nét và góc cạnh</h4>
                  <p>Ảnh CCCD cần chụp vuông vức, không bị mất góc hay che khuất.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>03</div>
                <div className={styles.stepContent}>
                  <h4>Dung lượng chuẩn</h4>
                  <p>Hệ thống hỗ trợ file dưới 5MB để tối ưu tốc độ. Vui lòng không nén quá mức.</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className={styles.supportCard}>
              <h3><HeadphonesIcon size={22} /> Cần hỗ trợ?</h3>
              <p>Liên hệ ngay bộ phận CSKH nếu bạn không thể tải ảnh lên.</p>
              <button className={styles.supportBtn}>Chat với CSKH <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
