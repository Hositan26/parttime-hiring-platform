import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { apiFetch } from '../../services/apiClient';
import styles from '../Login/Login.module.css';

// Handles password recovery without exposing account existence.
export const PasswordRecovery = () => {
  const path = useLocation().pathname;
  const reset = path === '/reset-password';
  const change = path === '/change-password';
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const invalid = (reset || change) && (password.length < 8 || password.length > 72 || password !== confirmation || (reset && !token));

  // Submits recovery details and displays the server's public result.
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await apiFetch('http://localhost:8088/parttime_hiring_platform/api/auth/' +
        (change ? 'change-password' : reset ? 'reset-password' : 'forgot-password'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change ? { currentPassword, password } : reset ? { token, password } : { email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Request failed');
      setMessage((reset || change) ? 'Mật khẩu đã được đặt lại. Hãy đăng nhập lại.' : 'Nếu tài khoản hợp lệ, liên kết đặt lại sẽ được gửi qua email.');
      setPassword('');
      setConfirmation('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };
  return <AuthLayout>
    <h2>{change ? 'Đổi mật khẩu' : reset ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}</h2>
    <form className={styles.form} onSubmit={submit}>
      {(reset || change) ? <>
        {change && <label>Mật khẩu hiện tại<input className={styles.input} type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></label>}
        <label>Mật khẩu mới (8–72 ký tự)
          <input className={styles.input} type="password" autoComplete="new-password" minLength={8} maxLength={72}
            value={password} onChange={event => setPassword(event.target.value)} required />
        </label>
        <label>Xác nhận mật khẩu
          <input className={styles.input} type="password" autoComplete="new-password"
            value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
        </label>
        {password && confirmation && password !== confirmation && <p role="alert">Mật khẩu xác nhận không khớp.</p>}
        {reset && !token && <p role="alert">Liên kết đặt lại không hợp lệ.</p>}
      </> : <label>Email
        <input className={styles.input} type="email" autoComplete="email" value={email}
          onChange={event => setEmail(event.target.value)} required />
      </label>}
      <button className={styles.primaryBtn} disabled={loading || invalid} type="submit">
        {loading ? 'Đang xử lý...' : reset ? 'Đặt lại mật khẩu' : 'Gửi liên kết'}
      </button>
      <p role="status">{message}</p>
      <Link to="/login">Quay lại đăng nhập</Link>
    </form>
  </AuthLayout>;
};

