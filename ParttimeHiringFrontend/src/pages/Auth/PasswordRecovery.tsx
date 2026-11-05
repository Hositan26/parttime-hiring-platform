import { passwordAllowed } from '../../services/authValidation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { apiFetch, apiBase } from '../../services/apiClient';
import styles from '../Login/Login.module.css';

// Handles password recovery and password change with a unified, premium UI.
export const PasswordRecovery = () => {
  const path = useLocation().pathname;
  const reset = path === '/reset-password';
  const change = path === '/change-password';
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const passwordInvalid = (reset || change) && password.length > 0 && !passwordAllowed(password);
  const mismatch = (reset || change) && password.length > 0 && confirmation.length > 0 && password !== confirmation;
  const invalid = (reset || change) && (!passwordAllowed(password) || password !== confirmation || (reset && !token));

  // Submits recovery details and displays the server's public result.
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      const response = await apiFetch(apiBase + '/auth/' +
        (change ? 'change-password' : reset ? 'reset-password' : 'forgot-password'), {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change ? { currentPassword, password } : reset ? { token, password } : { email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Yêu cầu không thành công.');
      setMessage((reset || change) 
        ? 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.' 
        : 'Nếu tài khoản hợp lệ, hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
      if (reset || change) window.dispatchEvent(new Event('auth:expired'));
      setPassword('');
      setConfirmation('');
      setCurrentPassword('');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Yêu cầu không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = change ? 'Đổi mật khẩu' : reset ? 'Đặt lại mật khẩu' : 'Quên mật khẩu';
  const pageSubtitle = change
    ? 'Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn.'
    : reset
    ? 'Nhập mật khẩu mới cho tài khoản của bạn.'
    : 'Nhập email liên kết với tài khoản để nhận liên kết khôi phục mật khẩu.';

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2>{pageTitle}</h2>
        <p>{pageSubtitle}</p>
      </div>

      <form className={styles.form} onSubmit={submit}>
        {errorMsg && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {message && (
          <div className={styles.errorAlert} role="status" style={{ backgroundColor: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#10B981' }} />
            <span>{message}</span>
          </div>
        )}

        {reset && !token && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>Liên kết đặt lại không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.</span>
          </div>
        )}

        {(reset || change) ? (
          <>
            {change && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu hiện tại</label>
                <div className={styles.inputWrapper}>
                  <KeyRound size={18} className={styles.inputIcon} />
                  <input 
                    className={styles.input} 
                    type={showCurrentPassword ? "text" : "password"} 
                    autoComplete="current-password" 
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword} 
                    onChange={event => setCurrentPassword(event.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className={styles.togglePasswordBtn} 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Mật khẩu mới (8–72 ký tự)</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input 
                  className={styles.input} 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="new-password" 
                  minLength={8} 
                  maxLength={72}
                  placeholder="Nhập mật khẩu mới"
                  value={password} 
                  onChange={event => setPassword(event.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className={styles.togglePasswordBtn} 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordInvalid && (
                <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px' }}>
                  Mật khẩu cần tối thiểu 8 ký tự và không vượt quá 72 ký tự.
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Xác nhận mật khẩu mới</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input 
                  className={styles.input} 
                  type={showConfirmation ? "text" : "password"} 
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmation} 
                  onChange={event => setConfirmation(event.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className={styles.togglePasswordBtn} 
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  aria-label={showConfirmation ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mismatch && (
                <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px' }} role="alert">
                  Mật khẩu xác nhận không khớp.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>Email tài khoản</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                className={styles.input} 
                type="email" 
                autoComplete="email" 
                placeholder="email@example.com"
                value={email}
                onChange={event => setEmail(event.target.value)} 
                required 
              />
            </div>
          </div>
        )}

        <button 
          className={styles.primaryBtn} 
          disabled={loading || invalid} 
          type="submit"
        >
          {loading ? 'Đang xử lý...' : reset ? 'Đặt lại mật khẩu' : change ? 'Cập nhật mật khẩu' : 'Gửi liên kết khôi phục'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
