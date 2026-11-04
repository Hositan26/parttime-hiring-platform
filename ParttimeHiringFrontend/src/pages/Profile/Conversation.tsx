import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/authContext';
import { apiBase, apiFetch } from '../../services/apiClient';

interface Interaction {
  id: number; kind: string; status: string; body: string; authorName: string;
  authorId: number; recipientId: number; meetingAt: string | null; createdAt: string;
}
const interviewLabels: Record<string, string> = {
  OPEN: 'Chờ phản hồi', ACCEPTED: 'Đã đồng ý', DECLINED: 'Đã từ chối', CANCELLED: 'Đã hủy',
};
export const Conversation = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [body, setBody] = useState('');
  const [meetingAt, setMeetingAt] = useState('');
  const [interview, setInterview] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const url = `${apiBase}/recruitment/applications/${applicationId}`;
  const valid = body.trim().length > 0 && body.length <= 2000 && (!interview || new Date(meetingAt).getTime() > now);
  const { data, loading, error: loadError } = usePagedResource<Interaction>(`${url}?page=${page}`, revision);
  const items = data?.content || [];
  const pages = data?.totalPages || 0;
  const send = async () => {
    if (!valid) return;
    if (interview && new Date(meetingAt).getTime() <= Date.now()) { setError('Lịch phỏng vấn phải ở tương lai.'); return; }
    setBusy(true); setError('');
    try {
      const response = await apiFetch(`${url}/${interview ? 'interviews' : 'messages'}`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: body.trim(), meetingAt: interview ? meetingAt : null }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Không thể gửi.');
      setBody(''); setMeetingAt(''); setPage(0); setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể gửi.'); }
    finally { setBusy(false); }
  };
  const respond = async (id: number, status: string) => {
    setBusy(true); setError('');
    try {
      const response = await apiFetch(`${apiBase}/recruitment/interviews/${id}?status=${status}`, { method: 'PUT' });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Không thể cập nhật lịch hẹn.');
      setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể cập nhật lịch hẹn.'); }
    finally { setBusy(false); }
  };
  return <MainLayout><h1>Trao đổi và phỏng vấn</h1><p>Lịch hẹn sử dụng giờ địa phương của hệ thống tuyển dụng.</p>
    <button className="btn-outline" onClick={() => setRevision(value => value + 1)}>Làm mới</button>
    {(error || loadError) && <p role="alert">{error || loadError}</p>}
    {loading ? <p>Đang tải...</p> : items.length === 0 ? <p>Chưa có nội dung trao đổi.</p> : items.map(item => <article key={item.id} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <strong>{item.authorName || 'Người tham gia'}</strong><p style={{ whiteSpace: 'pre-wrap' }}>{item.body}</p>
      <time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
      {item.kind === 'INTERVIEW' && <div><p>Phỏng vấn: {item.meetingAt && new Date(item.meetingAt).toLocaleString('vi-VN')} · {interviewLabels[item.status] || item.status}</p>
        {item.status === 'OPEN' && item.recipientId === user?.userId && <>
          <button className="btn-primary" disabled={busy} onClick={() => respond(item.id, 'ACCEPTED')}>Đồng ý</button>
          <button className="btn-outline" disabled={busy} onClick={() => respond(item.id, 'DECLINED')}>Từ chối</button>
        </>}
        {['OPEN', 'ACCEPTED'].includes(item.status) && <button className="btn-outline" disabled={busy} onClick={() => respond(item.id, 'CANCELLED')}>Hủy lịch</button>}
      </div>}
    </article>)}
    {pages > 1 && <nav aria-label="Phân trang trao đổi">
      <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Mới hơn</button>
      <span> Trang {page + 1} / {pages} </span>
      <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>Cũ hơn</button>
    </nav>}
    <form onSubmit={event => { event.preventDefault(); void send(); }}>
      <label><input type="checkbox" checked={interview} onChange={event => setInterview(event.target.checked)} /> Đề xuất lịch phỏng vấn</label>
      {interview && <label>Thời gian<input className="input-base" type="datetime-local" value={meetingAt} onChange={event => { setMeetingAt(event.target.value); setNow(Date.now()); }} required /></label>}
      <label>Nội dung<textarea className="input-base" value={body} maxLength={2000} onChange={event => setBody(event.target.value)} required /></label>
      {!valid && body && <p role="alert">Nội dung tối đa 2000 ký tự; lịch phỏng vấn phải ở tương lai.</p>}
      <button className="btn-primary" disabled={busy || !valid}>Gửi</button>
    </form>
  </MainLayout>;
};
