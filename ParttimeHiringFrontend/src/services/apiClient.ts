import { requiresSession, safeReturnPath } from './authPolicy.ts';

// Sends cookie-authenticated requests and handles expired protected sessions.
export const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const response = await fetch(input, { ...init, credentials: 'include' });
  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    if (requiresSession(window.location.pathname)) {
      const target = safeReturnPath(window.location.pathname + window.location.search);
      window.location.assign('/login?returnTo=' + encodeURIComponent(target));
    }
  }
  return response;
};
