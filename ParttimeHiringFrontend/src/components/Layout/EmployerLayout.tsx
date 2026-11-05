import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployerSidebar } from './EmployerSidebar';
import { EmployerTopbar } from './EmployerTopbar';
import styles from './EmployerLayout.module.css';

export const EmployerLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <EmployerSidebar 
        isOpenMobile={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />
      
      <div className={styles.mainArea}>
        <EmployerTopbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
