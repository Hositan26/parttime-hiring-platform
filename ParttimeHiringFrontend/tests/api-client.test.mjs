import test from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from '../src/services/apiClient.ts';
test('refreshes expired access once and retries the original request', async () => {
  const calls = [];
  globalThis.window = { dispatchEvent() {}, location: { pathname: '/jobs', search: '', assign() {} } };
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    if (String(url).endsWith('/auth/csrf')) return new Response(JSON.stringify({ result: 'csrf-test' }));
    return new Response('{}', { status: calls.length === 1 ? 401 : 200 });
  };
  const response = await apiFetch('http://localhost:8088/parttime_hiring_platform/api/users/me');
  assert.equal(response.status, 200);
  assert.equal(calls.length, 4);
  assert.ok(calls[2][0].endsWith('/api/auth/refresh'));
  assert.equal(calls[2][1].headers.get('X-XSRF-TOKEN'), 'csrf-test');
  assert.ok(calls.every(([, options]) => options.credentials === 'include'));
});

