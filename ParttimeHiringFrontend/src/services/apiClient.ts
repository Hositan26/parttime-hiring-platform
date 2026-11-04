import { requiresSession, safeReturnPath } from './authPolicy.ts';

let refreshInFlight: Promise<boolean> | null = null;

// Shares refresh rotation across concurrent failed requests in this browser tab.
const refreshSession = (url: string): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = fetch(url, { method: 'POST', credentials: 'include' })
      .then(response => response.ok).catch(() => false)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
};

// Retries expired access once before notifying protected screens of session loss.
export const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const options = { ...init, credentials: 'include' as RequestCredentials };
  let response = await fetch(input, options);
  const url = String(input);
  if (response.status === 401 && !url.includes('/api/auth/')) {
    const refreshUrl = url.replace(/\/api\/.*$/, '/api/auth/refresh');
    if (await refreshSession(refreshUrl)) response = await fetch(input, options);
  }
  if (response.status === 401 && !url.includes('/api/auth/')) {
    window.dispatchEvent(new Event('auth:expired'));
    if (requiresSession(window.location.pathname)) {
      const target = safeReturnPath(window.location.pathname + window.location.search);
      window.location.assign('/login?returnTo=' + encodeURIComponent(target));
    }
  }
  return response;
};
