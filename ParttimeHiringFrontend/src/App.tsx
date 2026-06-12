import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Jobs } from './pages/Jobs/Jobs';
import { JobDetail } from './pages/Jobs/JobDetail';
import { AppliedJobs } from './pages/AppliedJobs/AppliedJobs';
import { Profile } from './pages/Profile/Profile';
import { VerifyBusiness } from './pages/VerifyBusiness/VerifyBusiness';
import { OAuth2RedirectHandler } from './pages/Auth/OAuth2RedirectHandler';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify-business" element={<VerifyBusiness />} />
        
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Redirect unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
