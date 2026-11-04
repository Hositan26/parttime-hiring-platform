import { requiresSession, safeReturnPath } from './authPolicy.ts';

const apiBase = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8088/parttime_hiring_platform/api';
let refreshInFlight: Promise<boolean> | null = null;
let csrfInFlight: Promise<string> | null = null;

// Maps existing endpoint paths onto the environment's configured API base.
export const apiUrl = (input: RequestInfo | URL): string => {
  const value = String(input);
  const suffix = value.match(/\/api(\/.*)?$/)?.[1];
  return suffix !== undefined ? apiBase.replace(/\/$/, '') + suffix : value;
};

// Fetches a cookie-bound CSRF credential for state-changing browser requests.
const csrfToken = (): Promise<string> => {
  if (!csrfInFlight) {
    csrfInFlight = fetch(apiBase + '/auth/csrf', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error('Could not initialize request protection');
        const data = await response.json();
        return data.result as string;
      }).finally(() => { csrfInFlight = null; });
  }
  return csrfInFlight;
};

// Attaches cookie credentials and CSRF protection without exposing access tokens.
const send = async (input: RequestInfo | URL, init: RequestInit): Promise<Response> => {
  const headers = new Headers(init.headers);
  const method = (init.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-XSRF-TOKEN', await csrfToken());
  return fetch(apiUrl(input), { ...init, headers, credentials: 'include' });
};

// Shares refresh rotation across concurrent expired requests in the current tab.
const refreshSession = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = send(apiBase + '/auth/refresh', { method: 'POST' })
      .then(response => response.ok).catch(() => false)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
};

// Retries expired access once before notifying protected screens of session loss.
export const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  let response = await send(input, init);
  const authenticationRequest = apiUrl(input).includes('/auth/');
  if (response.status === 401 && !authenticationRequest && await refreshSession()) {
    response = await send(input, init);
  }
  if (response.status === 401 && !authenticationRequest) {
    window.dispatchEvent(new Event('auth:expired'));
    if (requiresSession(window.location.pathname)) {
      const target = safeReturnPath(window.location.pathname + window.location.search);
      window.location.assign('/login?returnTo=' + encodeURIComponent(target));
    }
  }
  return response;
};
