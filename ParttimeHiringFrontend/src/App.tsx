import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Jobs } from './pages/Jobs/Jobs';
import { JobDetail } from './pages/Jobs/JobDetail';
import { AppliedJobs } from './pages/AppliedJobs/AppliedJobs';
import { Profile } from './pages/Profile/Profile';
import { VerifyBusiness } from './pages/VerifyBusiness/VerifyBusiness';
import { OAuth2RedirectHandler } from './pages/Auth/OAuth2RedirectHandler';

// Employer Routes
import { EmployerLayout } from './components/Layout/EmployerLayout';
import { Dashboard as EmployerDashboard } from './pages/Employer/Dashboard/Dashboard';
import { Stores as EmployerStores } from './pages/Employer/Stores/Stores';
import { StoreDetail as EmployerStoreDetail } from './pages/Employer/Stores/StoreDetail';
import { Jobs as EmployerJobs } from './pages/Employer/Jobs/Jobs';
import { Applications as EmployerApplications } from './pages/Employer/Applications/Applications';
import EmployerEmployees from './pages/Employer/Employees/Employees';
import { Profile as EmployerProfile } from './pages/Employer/Profile/Profile';

import { AdminRoute } from './components/ProtectedRoute/AdminRoute';
import { AdminLayout } from './components/Layout/AdminLayout';
import { AdminVerifications } from './pages/Admin/Verifications/AdminVerifications';
import { AdminUsers } from './pages/Admin/Users/AdminUsers';
import { AdminEmployers } from './pages/Admin/Employers/AdminEmployers';
import { AdminJobPosts } from './pages/Admin/JobPosts/AdminJobPosts';
import { AdminStores } from './pages/Admin/Stores/AdminStores';
import { AdminCategories } from './pages/Admin/Categories/AdminCategories';
import { AdminShifts } from './pages/Admin/Shifts/AdminShifts';
import { AdminReviews } from './pages/Admin/Reviews/AdminReviews';
import { AdminDashboard } from './pages/Admin/Dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify-business" element={<VerifyBusiness />} />
        
        {/* Employer Routes */}
        <Route path="/employer" element={<EmployerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="stores" element={<EmployerStores />} />
          <Route path="stores/:id" element={<EmployerStoreDetail />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="applications" element={<EmployerApplications />} />
          <Route path="employees" element={<EmployerEmployees />} />
          <Route path="profile" element={<EmployerProfile />} />
          {/* Fallback for settings or missing pages */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="employers" element={<AdminEmployers />} />
            <Route path="jobs" element={<AdminJobPosts />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="shifts" element={<AdminShifts />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
