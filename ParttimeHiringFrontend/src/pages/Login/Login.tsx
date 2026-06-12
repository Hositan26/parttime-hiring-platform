import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import styles from './Login.module.css';
import { login } from '../../services/auth.service';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token); // Lưu token
      navigate('/jobs'); // Chuyển hướng
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8088/parttime_hiring_platform/oauth2/authorization/google';
  };

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2>Chào mừng bạn quay lại!</h2>
        <p>Vui lòng đăng nhập để tiếp tục sử dụng tài khoản của bạn.</p>
      </div>

      <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Tiếp tục với Google
      </button>

      <div className={styles.divider}>
        <span>hoặc tiếp tục với</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorAlert}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Username</label>
          <div className={styles.inputWrapper}>
            <User size={18} className={styles.inputIcon} />
            <input 
              type="text" 
              className={styles.input}
              placeholder="Nhập username của bạn" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Mật khẩu</label>
            <Link to="#" className={styles.forgotPassword}>Quên mật khẩu?</Link>
          </div>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className={styles.togglePasswordBtn} 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.rememberMe}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" defaultChecked />
            <span className={styles.checkmark}></span>
            Ghi nhớ đăng nhập trong 30 ngày
          </label>
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập tài khoản'}
        </button>

        <Link to="#" className={styles.employerBtn}>
          <Sparkles size={16} /> Tôi là nhà tuyển dụng → Xác minh ngay
        </Link>

        <p className={styles.registerPrompt}>
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
        </p>
      </form>
    </AuthLayout>
  );
};
