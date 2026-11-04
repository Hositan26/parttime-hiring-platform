import { useState } from 'react';
import { apiBase, apiFetch } from '../../services/apiClient';

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
    setBusy(true); setError('');
    try {
      const response = await apiFetch(url); const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải đánh giá.');
      setExists(Boolean(data.result)); setRating(data.result?.rating || 5);
      setComment(data.result?.comment || ''); setStatus(data.result?.status || ''); setOpen(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải đánh giá.'); }
    finally { setBusy(false); }
  };
  const change = async (remove: boolean) => {
    if (remove && !window.confirm('Xóa đánh giá của bạn?')) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await apiFetch(url, { method: remove ? 'DELETE' : 'PUT',
        headers: remove ? undefined : { 'Content-Type': 'application/json' },
        body: remove ? undefined : JSON.stringify({ rating, comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể cập nhật đánh giá.');
      setExists(!remove); setStatus(data.result?.status || ''); setOpen(false);
      setMessage(remove ? 'Đã xóa đánh giá.' : 'Đã lưu đánh giá.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể cập nhật đánh giá.'); }
    finally { setBusy(false); }
  };
  return <div>
    <button className="btn-outline" disabled={busy} onClick={load}>Đánh giá trải nghiệm làm việc</button>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {open && <form onSubmit={event => { event.preventDefault(); void change(false); }}>
      {status && status !== 'VISIBLE' && <p>Đánh giá đang được kiểm duyệt. Việc sửa nội dung không thay đổi trạng thái này.</p>}
      <label>Số sao<select className="input-base" value={rating} onChange={event => setRating(Number(event.target.value))}>
        {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} sao</option>)}
      </select></label>
      <label>Nhận xét<textarea className="input-base" value={comment} maxLength={2000} onChange={event => setComment(event.target.value)} /></label>
      <button className="btn-primary" disabled={busy || rating < 1 || rating > 5 || comment.length > 2000}>Lưu đánh giá</button>
      {exists && <button type="button" className="btn-outline" disabled={busy} onClick={() => change(true)}>Xóa đánh giá</button>}
      <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Hủy</button>
    </form>}
  </div>;
};
