import { useState } from 'react';
import { apiBase, apiFetch } from '../../services/apiClient';
import { Star, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';

export const ReviewEditor = ({ employmentId }: { employmentId: number }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const url = `${apiBase}/users/employments/${employmentId}/review`;

  const load = async () => {
    setBusy(true); 
    setError('');
    try {
      const response = await apiFetch(url); 
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải đánh giá.');
      setExists(Boolean(data.result)); 
      setRating(data.result?.rating || 5);
      setComment(data.result?.comment || ''); 
      setStatus(data.result?.status || ''); 
      setOpen(true);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể tải đánh giá.'); 
    } finally { 
      setBusy(false); 
    }
  };

  const change = async (remove: boolean) => {
    if (remove && !window.confirm('Bạn có chắc muốn xóa đánh giá của mình cho nơi làm việc này?')) return;
    setBusy(true); 
    setError(''); 
    setMessage('');
    try {
      const response = await apiFetch(url, { 
        method: remove ? 'DELETE' : 'PUT',
        headers: remove ? undefined : { 'Content-Type': 'application/json' },
        body: remove ? undefined : JSON.stringify({ rating, comment }) 
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể cập nhật đánh giá.');
      setExists(!remove); 
      setStatus(data.result?.status || ''); 
      setOpen(false);
      setMessage(remove ? 'Đã xóa đánh giá thành công.' : 'Đã lưu đánh giá trải nghiệm làm việc!');
      setTimeout(() => setMessage(''), 3000);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể cập nhật đánh giá.'); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div>
      {!open && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-outline" 
            disabled={busy} 
            onClick={load}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem' }}
          >
            <Star size={14} color="#F59E0B" />
            <span>{exists ? 'Xem / Chỉnh sửa đánh giá' : 'Đánh giá trải nghiệm làm việc'}</span>
          </button>
          {message && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontSize: '0.8125rem' }} role="status">
              <CheckCircle2 size={14} color="var(--success)" />
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontSize: '0.8125rem', marginTop: '8px' }} role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {open && (
        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <span>{exists ? 'Cập nhật đánh giá' : 'Viết đánh giá nơi làm việc'}</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={event => { event.preventDefault(); void change(false); }}>
            {status && status !== 'VISIBLE' && (
              <div style={{ padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', color: '#92400E', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                Đánh giá này đang trong quá trình kiểm duyệt bởi ban quản trị.
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                Mức độ hài lòng
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: rating === value ? 'var(--warning)' : 'var(--border-color)',
                      backgroundColor: rating === value ? '#FFFBEB' : 'var(--bg-white)',
                      color: rating === value ? '#B45309' : 'var(--text-dark)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: rating === value ? 700 : 500
                    }}
                  >
                    <Star size={14} fill={value <= rating ? '#F59E0B' : 'none'} color={value <= rating ? '#F59E0B' : '#94A3B8'} />
                    <span>{value} sao</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                Nhận xét chi tiết về môi trường làm việc
              </label>
              <textarea 
                className="input-base" 
                value={comment} 
                maxLength={2000} 
                rows={3}
                placeholder="Chia sẻ về sự hỗ trợ của quản lý, môi trường làm việc, tính đúng giờ của việc trả lương..."
                onChange={event => setComment(event.target.value)} 
                style={{ resize: 'vertical' }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                {comment.length} / 2000
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                {exists && (
                  <button 
                    type="button" 
                    className="btn-outline" 
                    disabled={busy} 
                    onClick={() => change(true)}
                    style={{ color: 'var(--danger)', borderColor: '#FECACA', fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                  >
                    <Trash2 size={14} /> Xóa đánh giá
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setOpen(false)}
                  style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={busy || rating < 1 || rating > 5 || comment.length > 2000}
                  style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
                >
                  {busy ? 'Đang lưu...' : 'Lưu đánh giá'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
