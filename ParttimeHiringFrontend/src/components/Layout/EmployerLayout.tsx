import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { EmployerTopbar } from './EmployerTopbar';
import styles from './EmployerLayout.module.css';

export const EmployerLayout: React.FC = () => {
  return (
    <div className={styles.layoutContainer}>
      <EmployerSidebar />
      <div className={styles.mainArea}>
        <EmployerTopbar />
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
