import test from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from '../src/services/apiClient.ts';
test('refreshes expired access once and retries the original request', async () => {
  const calls = [];
  globalThis.window = { dispatchEvent() {}, location: { pathname: '/jobs', search: '', assign() {} } };
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    return new Response('{}', { status: calls.length === 1 ? 401 : 200 });
  };
  const response = await apiFetch('http://localhost:8088/parttime_hiring_platform/api/users/me');
  assert.equal(response.status, 200);
  assert.equal(calls.length, 3);
  assert.ok(calls[1][0].endsWith('/api/auth/refresh'));
  assert.ok(calls.every(([, options]) => options.credentials === 'include'));
});
