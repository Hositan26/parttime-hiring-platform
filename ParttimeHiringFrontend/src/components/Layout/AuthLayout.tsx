import React from 'react';
import { Briefcase, Users, Building2, Sparkles } from 'lucide-react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Left side - Branding & Image */}
        <div className={styles.leftPanel}>
          <div className={styles.branding}>
            <div className={styles.logoWrapper}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <Briefcase size={20} color="white" />
                </div>
                <span className={styles.logoText}>JobPortal</span>
              </div>
            </div>

            <div className={styles.badge}>
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Nền tảng việc làm part-time dành cho sinh viên</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Hành trình nghề nghiệp của bạn <span className={styles.highlight}>bắt đầu<br/>ngay hôm nay.</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Kết nối với các nhà tuyển dụng uy tín cùng những công việc part-time linh hoạt, phù hợp dành cho sinh viên.
            </p>
            
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <Briefcase size={20} />
                </div>
                <div className={styles.statInfo}>
                  <strong>500+</strong>
                  <span>Việc làm</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <Users size={20} />
                </div>
                <div className={styles.statInfo}>
                  <strong>1000+</strong>
                  <span>Ứng viên</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                  <Building2 size={20} />
                </div>
                <div className={styles.statInfo}>
                  <strong>200+</strong>
                  <span>Nhà tuyển dụng</span>
                </div>
              </div>
            </div>

            <div className={styles.imageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Students working together" 
                className={styles.heroImage}
              />
              <div className={styles.avatarsWrapper}>
                <div className={styles.avatars}>
                  <img src="https://i.pravatar.cc/150?img=11" alt="User 1" className={styles.avatar} />
                  <img src="https://i.pravatar.cc/150?img=12" alt="User 2" className={styles.avatar} />
                  <img src="https://i.pravatar.cc/150?img=5" alt="User 3" className={styles.avatar} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className={styles.rightPanel}>
          <div className={`${styles.formContainer} animate-fade-in-up`}>
            {children}
          </div>
        </div>
      </div>

      <footer className={styles.globalFooter}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 JobPortal. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Trung tâm hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
