import { AuthProvider } from './context/AuthProvider';
import { RoleRoute } from './components/ProtectedRoute/RoleRoute';
import { PasswordRecovery } from './pages/Auth/PasswordRecovery';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Jobs } from './pages/Jobs/Jobs';
import { JobReports } from './pages/Jobs/JobReports';
import { SavedJobs } from './pages/Jobs/SavedJobs';
import { JobDetail } from './pages/Jobs/JobDetail';
import { AppliedJobs } from './pages/AppliedJobs/AppliedJobs';
import { Profile } from './pages/Profile/Profile';
import { Conversation } from './pages/Profile/Conversation';
import { Notifications } from './pages/Profile/Notifications';
import { CandidateProfile } from './pages/Profile/CandidateProfile';
import { EmploymentHistory } from './pages/Profile/EmploymentHistory';
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
import { AdminReports } from './pages/Admin/Reports/AdminReports';
import { AdminReviews } from './pages/Admin/Reviews/AdminReviews';
import { AdminDashboard } from './pages/Admin/Dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider><Routes>
        {/* Existing Routes */}
        <Route path="/change-password" element={<RoleRoute><PasswordRecovery /></RoleRoute>} />
        <Route path="/forgot-password" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<PasswordRecovery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/job-reports" element={<RoleRoute><JobReports /></RoleRoute>} />
        <Route path="/saved-jobs" element={<RoleRoute roles={['USER']}><SavedJobs /></RoleRoute>} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/applied-jobs" element={<RoleRoute roles={['USER']}><AppliedJobs /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute><Profile /></RoleRoute>} />
        <Route path="/applications/:applicationId/conversation" element={<RoleRoute><Conversation /></RoleRoute>} />
        <Route path="/notifications" element={<RoleRoute><Notifications /></RoleRoute>} />
        <Route path="/candidate-profile" element={<RoleRoute><CandidateProfile /></RoleRoute>} />
        <Route path="/candidate-profile/applications/:applicationId" element={<RoleRoute><CandidateProfile /></RoleRoute>} />
        <Route path="/employment-history" element={<RoleRoute roles={['USER']}><EmploymentHistory /></RoleRoute>} />
        <Route path="/verify-business" element={<RoleRoute><VerifyBusiness /></RoleRoute>} />
        
        {/* Employer Routes */}
        <Route path="/employer" element={<RoleRoute roles={['EMPLOYER']}><EmployerLayout /></RoleRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="stores" element={<EmployerStores />} />
          <Route path="stores/:id" element={<EmployerStoreDetail />} />
          <Route path="jobs" element={<EmployerJobs />} />
          <Route path="applications" element={<EmployerApplications />} />
          <Route path="notifications" element={<Notifications employer />} />
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
            <Route path="reports" element={<AdminReports />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes></AuthProvider>
    </Router>
  );
}

export default App;



