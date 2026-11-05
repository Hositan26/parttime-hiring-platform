import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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
    setBusy(true); 
    setError('');
    try {
      const response = await apiFetch(`${apiBase}/recruitment/jobs/${jobId}/reports`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ body: body.trim() }) 
      });
      const data = await response.json(); 
      if (!response.ok) throw new Error(data.message || 'Không thể gửi báo cáo.');
      setMessage('Đã gửi báo cáo vi phạm. Quản trị viên sẽ sớm xem xét.'); 
      setBody('');
      setTimeout(() => {
        setOpen(false);
        setMessage('');
      }, 2500);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể gửi báo cáo.'); 
    } finally { 
      setBusy(false); 
    }
  };

  if (!user) {
    return (
      <Link 
        to={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
        style={{ fontSize: '0.8125rem', color: 'var(--text-gray)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
      >
        <Flag size={14} /> Đăng nhập để báo cáo tin tuyển dụng
      </Link>
    );
  }

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          type="button"
          onClick={() => { setOpen(true); setError(''); setMessage(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-gray)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-gray)')}
        >
          <Flag size={14} /> Báo cáo tin này
        </button>
      </div>

      {open && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <Flag size={18} />
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-dark)' }}>Báo cáo tin tuyển dụng</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '4px' }}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '1rem', lineHeight: '1.5' }}>
              Hãy cho chúng tôi biết vấn đề bạn gặp phải với tin tuyển dụng này (lừa đảo, thông tin sai lệch, quấy rối...).
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }} role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', fontSize: '0.85rem', marginBottom: '1rem' }} role="status">
                <CheckCircle2 size={16} style={{ flexShrink: 0, color: 'var(--success)' }} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={event => { event.preventDefault(); void send(); }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                  Lý do báo cáo <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea 
                  className="input-base" 
                  value={body} 
                  maxLength={2000} 
                  required 
                  rows={4}
                  placeholder="Mô tả cụ thể lý do vi phạm..."
                  onChange={event => setBody(event.target.value)} 
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
                  <span>Tối đa 2000 ký tự</span>
                  <span>{body.length} / 2000</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-danger" 
                  disabled={busy || !body.trim() || body.length > 2000}
                >
                  <Send size={15} />
                  {busy ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
