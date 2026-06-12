import React from 'react';
import { MainLayout } from '../../components/Layout/MainLayout';
import styles from './AppliedJobs.module.css';

export const AppliedJobs: React.FC = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <h1>Công việc đã ứng tuyển</h1>
          <p>Theo dõi toàn bộ công việc bạn đã gửi đơn ứng tuyển.</p>
        </div>
        
        <div className={styles.contentCard}>
          <p className={styles.errorText}>You do not have permission</p>
        </div>
      </div>
    </MainLayout>
  );
};
