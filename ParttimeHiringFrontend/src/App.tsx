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
        
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
