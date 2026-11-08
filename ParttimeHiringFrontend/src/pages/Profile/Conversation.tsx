import { usePagedResource } from '../../services/usePagedResource';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useAuth } from '../../context/authContext';
import { hasAnyRole } from '../../services/authPolicy';
import { apiBase, apiFetch } from '../../services/apiClient';
import { MessageSquare, Calendar, Send, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCcw, User } from 'lucide-react';

interface Interaction {
  id: number; 
  kind: string; 
  status: string; 
  body: string; 
  authorName: string;
  authorId: number; 
  recipientId: number; 
  meetingAt: string | null; 
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return <span className="badge-success"><CheckCircle2 size={12} /> Đã đồng ý</span>;
    case 'DECLINED': return <span className="badge-danger"><XCircle size={12} /> Đã từ chối</span>;
    case 'CANCELLED': return <span className="badge-neutral"><AlertCircle size={12} /> Đã hủy</span>;
    default: return <span className="badge-warning"><Clock size={12} /> Chờ phản hồi</span>;
  }
};

export const Conversation = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const isEmployer = hasAnyRole(user?.roles || [], ['EMPLOYER']);

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
    if (interview && new Date(meetingAt).getTime() <= Date.now()) { 
      setError('Lịch phỏng vấn phải được đặt ở thời gian trong tương lai.'); 
      return; 
    }
    setBusy(true); 
    setError('');
    try {
      const response = await apiFetch(`${url}/${interview ? 'interviews' : 'messages'}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ body: body.trim(), meetingAt: interview ? meetingAt : null }) 
      });
      const resData = await response.json(); 
      if (!response.ok) throw new Error(resData.message || 'Không thể gửi tin nhắn.');
      setBody(''); 
      setMeetingAt(''); 
      setInterview(false);
      setPage(0); 
      setRevision(value => value + 1);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể gửi tin nhắn.'); 
    } finally { 
      setBusy(false); 
    }
  };

  const respond = async (id: number, status: string) => {
    setBusy(true); 
    setError('');
    try {
      const response = await apiFetch(`${apiBase}/recruitment/interviews/${id}?status=${status}`, { method: 'PUT' });
      const resData = await response.json(); 
      if (!response.ok) throw new Error(resData.message || 'Không thể cập nhật lịch hẹn.');
      setRevision(value => value + 1);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể cập nhật lịch hẹn.'); 
    } finally { 
      setBusy(false); 
    }
  };

  const returnTarget = isEmployer ? '/employer/applications' : '/applied-jobs';

  return (
    <MainLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Breadcrumb & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link to={returnTarget} style={{ color: 'var(--text-gray)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Quay lại danh sách đơn
          </Link>
          <button 
            type="button" 
            className="btn-outline" 
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            onClick={() => setRevision(v => v + 1)}
          >
            <RefreshCcw size={14} /> Làm mới
          </button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>
            Trao đổi & Lịch hẹn phỏng vấn
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
            Kênh liên lạc trực tiếp giữa ứng viên và nhà tuyển dụng cho đơn ứng tuyển #{applicationId}.
          </p>
        </div>

        {(error || loadError) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.25rem', fontSize: '0.9rem' }} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error || loadError}</span>
          </div>
        )}

        {/* Message Thread Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-gray)' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
              <p>Đang tải nội dung trao đổi...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-lighter)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <MessageSquare size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', marginBottom: '6px' }}>Chưa có tin nhắn hoặc lịch hẹn nào</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', margin: 0 }}>
                Hãy gửi tin nhắn đầu tiên hoặc đề xuất lịch phỏng vấn bên dưới để bắt đầu trao đổi.
              </p>
            </div>
          ) : (
            items.map(item => {
              const isMe = item.authorId === user?.userId;
              const isInterview = item.kind === 'INTERVIEW';

              return (
                <div 
                  key={item.id} 
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderLeft: isInterview ? '4px solid var(--warning)' : isMe ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isInterview ? '#FFFDF5' : 'var(--bg-white)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isMe ? 'var(--primary-light)' : 'var(--bg-lighter)', color: isMe ? 'var(--primary)' : 'var(--text-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        <User size={14} />
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: isMe ? 'var(--primary-dark)' : 'var(--text-dark)' }}>
                        {item.authorName || 'Người tham gia'} {isMe ? '(Bạn)' : ''}
                      </strong>
                      {isInterview && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'var(--warning-light)', color: '#B45309' }}>
                          LỊCH PHỎNG VẤN
                        </span>
                      )}
                    </div>
                    <time style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {item.body}
                  </p>

                  {/* Interview Specific Block */}
                  {isInterview && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px dashed #FDE68A', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                          <Calendar size={16} color="var(--warning)" />
                          <span>Thời gian đề xuất: <strong>{item.meetingAt ? new Date(item.meetingAt).toLocaleString('vi-VN') : 'Chưa xác định'}</strong></span>
                        </div>
                        <div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      {/* Action buttons based on status and recipient */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {item.status === 'OPEN' && item.recipientId === user?.userId && (
                          <>
                            <button 
                              type="button" 
                              className="btn-primary" 
                              disabled={busy} 
                              style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
                              onClick={() => respond(item.id, 'ACCEPTED')}
                            >
                              <CheckCircle2 size={14} /> Đồng ý tham gia
                            </button>
                            <button 
                              type="button" 
                              className="btn-outline" 
                              disabled={busy} 
                              style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', color: '#DC2626', borderColor: '#FECACA' }}
                              onClick={() => respond(item.id, 'DECLINED')}
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                          </>
                        )}

                        {['OPEN', 'ACCEPTED'].includes(item.status) && (
                          <button 
                            type="button" 
                            className="btn-outline" 
                            disabled={busy} 
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}
                            onClick={() => respond(item.id, 'CANCELLED')}
                          >
                            Hủy lịch hẹn này
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <nav 
            aria-label="Phân trang trao đổi"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}
          >
            <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>
              Mới hơn
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
              Trang <strong>{page + 1}</strong> / {pages}
            </span>
            <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>
              Cũ hơn
            </button>
          </nav>
        )}

        {/* Message Composer Card */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={event => { event.preventDefault(); void send(); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                <input 
                  type="checkbox" 
                  checked={interview} 
                  onChange={event => setInterview(event.target.checked)} 
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                /> 
                <Calendar size={16} color="var(--warning)" /> Đề xuất lịch phỏng vấn
              </label>
            </div>

            {interview && (
              <div style={{ marginBottom: '1rem', padding: '12px 14px', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#92400E', marginBottom: '6px' }}>
                  Thời gian phỏng vấn (giờ tương lai) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input 
                  className="input-base" 
                  type="datetime-local" 
                  value={meetingAt} 
                  required 
                  onChange={event => { setMeetingAt(event.target.value); setNow(Date.now()); }} 
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.375rem' }}>
                {interview ? 'Ghi chú về buổi phỏng vấn' : 'Nội dung tin nhắn'} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea 
                className="input-base" 
                value={body} 
                maxLength={2000} 
                rows={3}
                placeholder={interview ? 'Ví dụ: Mời bạn đến phỏng vấn tại cửa hàng hoặc qua Google Meet...' : 'Nhập tin nhắn trao đổi...'}
                onChange={event => setBody(event.target.value)} 
                required 
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                <span>{!valid && body ? 'Nội dung tối đa 2000 ký tự; lịch phỏng vấn phải ở tương lai.' : ''}</span>
                <span>{body.length} / 2000</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={busy || !valid}
                style={{ padding: '0.625rem 1.5rem' }}
              >
                <Send size={15} /> {busy ? 'Đang gửi...' : interview ? 'Gửi đề xuất lịch' : 'Gửi tin nhắn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};
