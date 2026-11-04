import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { apiBase, apiFetch } from '../../services/apiClient';

export const ReportJob = ({ jobId }: { jobId: number }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const send = async () => {
    if (!body.trim() || body.length > 2000) return;
    setBusy(true); setError('');
    try {
      const response = await apiFetch(`${apiBase}/recruitment/jobs/${jobId}/reports`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: body.trim() }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Không thể gửi báo cáo.');
      setMessage('Đã gửi báo cáo để quản trị viên xem xét.'); setOpen(false); setBody('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể gửi báo cáo.'); }
    finally { setBusy(false); }
  };
  if (!user) return <Link to="/login">Đăng nhập để báo cáo tin tuyển dụng</Link>;
  return <div><button className="btn-outline" onClick={() => setOpen(!open)}>Báo cáo tin tuyển dụng</button>
    <Link to="/job-reports">Theo dõi báo cáo</Link>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {open && <form onSubmit={event => { event.preventDefault(); void send(); }}>
      <label>Lý do báo cáo<textarea className="input-base" value={body} maxLength={2000} required onChange={event => setBody(event.target.value)} /></label>
      <button className="btn-primary" disabled={busy || !body.trim() || body.length > 2000}>Gửi báo cáo</button>
    </form>}
  </div>;
};
