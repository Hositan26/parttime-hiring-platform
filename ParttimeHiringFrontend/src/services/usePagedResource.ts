import { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

interface Page<T> { content: T[]; totalPages: number; totalElements: number; }
interface Result<T> { key: string; data: T | null; error: string; }

// Keeps stale responses from replacing the currently selected resource page.
export const useApiResource = <T,>(url: string, revision = 0) => {
  const key = `${url}#${revision}`;
  const [result, setResult] = useState<Result<T>>({ key: '', data: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    apiFetch(url, { signal: controller.signal }).then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Không thể tải dữ liệu.');
      if (!controller.signal.aborted) setResult({ key, data: payload.result, error: '' });
    }).catch(failure => {
      if (!controller.signal.aborted) setResult({ key, data: null, error: failure instanceof Error ? failure.message : 'Không thể tải dữ liệu.' });
    });
    return () => controller.abort();
  }, [url, key]);
  const current = result.key === key;
  return { data: current ? result.data : null, error: current ? result.error : '', loading: !current };
};

// Reuses request cancellation and loading state for paginated API responses.
export const usePagedResource = <T,>(url: string, revision = 0) => useApiResource<Page<T>>(url, revision);
