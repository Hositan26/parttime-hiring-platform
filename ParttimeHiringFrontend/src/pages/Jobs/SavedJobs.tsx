import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/Layout/MainLayout';
import { apiBase, apiFetch } from '../../services/apiClient';
import type { Job } from '../../services/job.service';

export const SavedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    apiFetch(`${apiBase}/users/saved-jobs?page=${page}&size=12`).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tải việc đã lưu.');
      if (active) {
        if (page > 0 && data.result.content.length === 0) setPage(page - 1);
        else { setJobs(data.result.content); setPages(data.result.totalPages); }
      }
    }).catch(failure => { if (active) setError(failure.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, revision]);
  const remove = async (id: number) => {
    try {
      const response = await apiFetch(`${apiBase}/users/saved-jobs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Không thể bỏ lưu việc.');
      setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể bỏ lưu việc.'); }
  };
  return <MainLayout><h1>Việc đã lưu</h1>
    {error ? <p role="alert">{error}</p> : loading ? <p>Đang tải...</p> : jobs.length === 0 ? <p>Bạn chưa lưu việc nào.</p>
      : jobs.map(job => <article className="card" key={job.id} style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2><Link to={`/jobs/${job.id}`}>{job.title}</Link></h2><p>{job.store} — {job.location}</p>
        <p>{job.salary} · {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Tin đã ngừng tuyển'}</p>
        <button className="btn-outline" onClick={() => remove(job.id)}>Bỏ lưu</button>
      </article>)}
    {pages > 1 && <nav aria-label="Phân trang việc đã lưu">
      <button className="btn-outline" disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Trang trước</button>
      <span> Trang {page + 1} / {pages} </span>
      <button className="btn-outline" disabled={loading || page + 1 >= pages} onClick={() => setPage(page + 1)}>Trang sau</button>
    </nav>}
  </MainLayout>;
};
