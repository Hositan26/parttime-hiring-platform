import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, ArrowLeft, ShieldAlert, Sparkles, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { hasAnyRole } from '../../services/authPolicy';

export const CandidateProfile = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = hasAnyRole(user?.roles || [], ['EMPLOYER']);
  const shared = Boolean(applicationId);
  const url = `${apiBase}/candidate-profiles/${shared ? `applications/${applicationId}` : 'me'}`;
  
  const [fields, setFields] = useState({ summary: '', skills: '', experience: '' });
  const [hasResume, setHasResume] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState('');
  const loading = loadedUrl !== url;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [isAccessRevoked, setIsAccessRevoked] = useState(false);

  const valid = fields.summary.length <= 2000 && fields.skills.length <= 2000 && fields.experience.length <= 5000;

  const apply = (profile: { summary?: string; skills?: string; experience?: string; hasResume?: boolean; displayName?: string }) => {
    setFields({ summary: profile.summary || '', skills: profile.skills || '', experience: profile.experience || '' });
    setHasResume(Boolean(profile.hasResume)); 
    setName(profile.displayName || '');
  };

  useEffect(() => {
    let active = true;
    setIsAccessRevoked(false);
    setError('');

    apiFetch(url).then(async response => {
      const data = await response.json();
      if (response.status === 403) {
        if (active) setIsAccessRevoked(true);
        return;
      }
      if (!response.ok) throw new Error(data.message || 'Không thể tải hồ sơ ứng tuyển.');
      if (active) apply(data.result);
    }).catch(failure => { 
      if (active) setError(failure.message); 
    }).finally(() => { 
      if (active) setLoadedUrl(url); 
    });

    return () => { active = false; };
  }, [url]);

  const save = async (file?: File) => {
    if (!valid || shared) return;
    if (file && (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024)) {
      setError('CV phải ở định dạng PDF và dung lượng tối đa 5 MB.'); 
      return;
    }
    setBusy(true); 
    setError(''); 
    setMessage('');
    try {
      const form = new FormData(); 
      if (file) form.append('file', file);
      const response = await apiFetch(file ? `${url}/resume` : url, {
        method: file ? 'POST' : 'PUT', 
        body: file ? form : JSON.stringify(fields),
        headers: file ? undefined : { 'Content-Type': 'application/json' } 
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể lưu hồ sơ.');
      if (file) setHasResume(Boolean(data.result.hasResume)); 
      else apply(data.result);
      setMessage(file ? 'Tải lên CV thành công!' : 'Đã lưu thông tin hồ sơ ứng tuyển!');
      setTimeout(() => setMessage(''), 3000);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể lưu hồ sơ.'); 
    } finally { 
      setBusy(false); 
    }
  };

  const download = async () => {
    try {
      const response = await apiFetch(`${url}/resume`);
      if (!response.ok) throw new Error('Không thể tải tệp CV.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); 
      link.href = objectUrl; 
      link.download = `CV_${name || 'Candidate'}.pdf`; 
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (failure) { 
      setError(failure instanceof Error ? failure.message : 'Không thể tải CV.'); 
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          {shared ? (
            <button 
              onClick={() => isEmployer ? navigate('/employer/applications') : navigate('/applied-jobs')}
              style={{ background: 'none', border: 'none', color: 'var(--text-gray)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
            >
              <ArrowLeft size={16} /> Quay lại danh sách đơn ứng tuyển
            </button>
          ) : (
            <Link to="/profile" style={{ color: 'var(--text-gray)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
              <ArrowLeft size={16} /> Quay lại hồ sơ cá nhân
            </Link>
          )}
        </div>

        {/* Page Title & Intro */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                {shared ? `Hồ sơ ứng viên: ${name || 'Ứng viên'}` : 'Hồ sơ & CV ứng tuyển'}
              </h1>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                {shared 
                  ? 'Thông tin ứng tuyển và CV được ứng viên chia sẻ cho vị trí này.'
                  : 'Hồ sơ và CV này sẽ được gửi kèm khi bạn ứng tuyển vào các tin tuyển dụng.'}
              </p>
            </div>
          </div>
        </div>

        {/* Access Revoked Warning (Withdrawal) */}
        {isAccessRevoked && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldAlert size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
              Quyền xem hồ sơ và CV đã bị thu hồi
            </h3>
            <p style={{ color: 'var(--text-gray)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Ứng viên đã <strong>rút đơn ứng tuyển</strong> cho vị trí này. Theo chính sách bảo vệ dữ liệu, nhà tuyển dụng không còn quyền truy cập hồ sơ chi tiết và tệp CV của ứng viên.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => isEmployer ? navigate('/employer/applications') : navigate('/applied-jobs')}
            >
              Quay lại danh sách đơn
            </button>
          </div>
        )}

        {/* General Error or Success Message */}
        {error && !isAccessRevoked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--success-light)', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', marginBottom: '1.5rem', fontSize: '0.9rem' }} role="status">
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: 'var(--success)' }} />
            <span>{message}</span>
          </div>
        )}

        {/* Main Profile Form */}
        {!isAccessRevoked && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
              <p>Đang tải hồ sơ ứng tuyển...</p>
            </div>
          ) : (
            <form onSubmit={event => { event.preventDefault(); void save(); }}>
              {/* CV File Card */}
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: hasResume ? 'var(--success-light)' : 'var(--bg-lighter)', color: hasResume ? 'var(--success)' : 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-dark)' }}>
                        Tệp CV ứng tuyển (PDF)
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                        {hasResume ? 'Đã có tệp CV đính kèm' : 'Chưa có tệp CV đính kèm'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {hasResume && (
                      <button 
                        type="button" 
                        className="btn-outline" 
                        onClick={download}
                      >
                        <Download size={16} /> Tải CV về máy
                      </button>
                    )}

                    {!shared && (
                      <label 
                        className="btn-primary" 
                        style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
                      >
                        <Upload size={16} /> {hasResume ? 'Tải lên CV mới' : 'Tải lên CV (PDF)'}
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          disabled={busy} 
                          style={{ display: 'none' }}
                          onChange={event => {
                            const file = event.target.files?.[0]; 
                            if (file) void save(file); 
                            event.target.value = '';
                          }} 
                        />
                      </label>
                    )}
                  </div>
                </div>
                {!shared && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
                    * Hỗ trợ định dạng PDF, dung lượng tối đa 5 MB.
                  </p>
                )}
              </div>

              {/* Sections: Summary, Skills, Experience */}
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Giới thiệu */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="var(--primary)" /> Giới thiệu bản thân
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {fields.summary.length} / 2000 ký tự
                    </span>
                  </div>
                  <textarea 
                    className="input-base" 
                    readOnly={shared} 
                    value={fields.summary} 
                    maxLength={2000}
                    rows={4}
                    placeholder={shared ? 'Chưa cập nhật giới thiệu' : 'Tóm tắt ngắn gọn về bản thân, tính cách, mục tiêu tìm việc làm thêm...'}
                    onChange={event => setFields({ ...fields, summary: event.target.value })} 
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Kỹ năng */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="var(--primary)" /> Kỹ năng nổi bật
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {fields.skills.length} / 2000 ký tự
                    </span>
                  </div>
                  <textarea 
                    className="input-base" 
                    readOnly={shared} 
                    value={fields.skills} 
                    maxLength={2000}
                    rows={4}
                    placeholder={shared ? 'Chưa cập nhật kỹ năng' : 'Các kỹ năng giao tiếp, pha chế, thu ngân, ngoại ngữ, làm việc nhóm...'}
                    onChange={event => setFields({ ...fields, skills: event.target.value })} 
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Kinh nghiệm làm việc */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={16} color="var(--primary)" /> Kinh nghiệm làm việc & Hoạt động
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {fields.experience.length} / 5000 ký tự
                    </span>
                  </div>
                  <textarea 
                    className="input-base" 
                    readOnly={shared} 
                    value={fields.experience} 
                    maxLength={5000}
                    rows={5}
                    placeholder={shared ? 'Chưa cập nhật kinh nghiệm' : 'Mô tả kinh nghiệm từng làm việc part-time tại cửa hàng, quán cà phê hoặc hoạt động câu lạc bộ...'}
                    onChange={event => setFields({ ...fields, experience: event.target.value })} 
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              {!shared && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={busy || !valid}
                    style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                  >
                    {busy ? 'Đang lưu...' : 'Lưu hồ sơ ứng tuyển'}
                  </button>
                </div>
              )}
            </form>
          )
        )}
      </div>
    </MainLayout>
  );
};
