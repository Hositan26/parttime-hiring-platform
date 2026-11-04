import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';

export const CandidateProfile = () => {
  const { applicationId } = useParams();
  const shared = Boolean(applicationId);
  const url = `${apiBase}/candidate-profiles/${shared ? `applications/${applicationId}` : 'me'}`;
  const [fields, setFields] = useState({ summary: '', skills: '', experience: '' });
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const valid = fields.summary.length <= 2000 && fields.skills.length <= 2000 && fields.experience.length <= 5000;
  const apply = (profile: { summary?: string; skills?: string; experience?: string; hasResume?: boolean; displayName?: string }) => {
    setFields({ summary: profile.summary || '', skills: profile.skills || '', experience: profile.experience || '' });
    setHasResume(Boolean(profile.hasResume)); setName(profile.displayName || '');
  };
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    apiFetch(url).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải hồ sơ ứng tuyển.');
      if (active) apply(data.result);
    }).catch(failure => { if (active) setError(failure.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url]);
  const save = async (file?: File) => {
    if (!valid || shared) return;
    if (file && (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024)) {
      setError('CV phải là PDF tối đa 5 MB.'); return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      const form = new FormData(); if (file) form.append('file', file);
      const response = await apiFetch(file ? `${url}/resume` : url, {
        method: file ? 'POST' : 'PUT', body: file ? form : JSON.stringify(fields),
        headers: file ? undefined : { 'Content-Type': 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể lưu hồ sơ.');
      apply(data.result); setMessage(file ? 'Đã tải lên CV.' : 'Đã lưu hồ sơ.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể lưu hồ sơ.'); }
    finally { setBusy(false); }
  };
  const download = async () => {
    try {
      const response = await apiFetch(`${url}/resume`);
      if (!response.ok) throw new Error('Không thể tải CV.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = objectUrl; link.download = 'resume.pdf'; link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể tải CV.'); }
  };
  return <MainLayout><h1>Hồ sơ ứng tuyển {shared && name ? `— ${name}` : ''}</h1>
    {!shared && <p>Hồ sơ và CV hiện tại được chia sẻ với doanh nghiệp bạn đã nộp đơn. Rút đơn sẽ dừng quyền xem qua đơn đó.</p>}
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {loading ? <p>Đang tải...</p> : <form onSubmit={event => { event.preventDefault(); void save(); }}>
      {(['summary', 'skills', 'experience'] as const).map(field => <label key={field} style={{ display: 'block', marginBottom: '1rem' }}>
        {field === 'summary' ? 'Giới thiệu' : field === 'skills' ? 'Kỹ năng' : 'Kinh nghiệm'}
        <textarea className="input-base" readOnly={shared} value={fields[field]} maxLength={field === 'experience' ? 5000 : 2000}
          onChange={event => setFields({ ...fields, [field]: event.target.value })} />
      </label>)}
      {!shared && <><button className="btn-primary" disabled={busy || !valid}>Lưu hồ sơ</button>
        <label>CV (PDF, tối đa 5 MB)<input type="file" accept="application/pdf" disabled={busy} onChange={event => {
          const file = event.target.files?.[0]; if (file) void save(file); event.target.value = '';
        }} /></label></>}
      {hasResume && <button type="button" className="btn-outline" onClick={download}>Tải CV</button>}
    </form>}
  </MainLayout>;
};
