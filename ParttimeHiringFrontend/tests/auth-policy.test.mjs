import test from 'node:test';
import assert from 'node:assert/strict';
import { safeReturnPath, requiresSession } from '../src/services/authPolicy.ts';
test('preserves local destinations and rejects external redirects', () => {
  assert.equal(safeReturnPath('/employer/jobs?page=2'), '/employer/jobs?page=2');
  for (const path of ['//evil.example', 'https://evil.example', '/login', '/\\evil.example']) {
    assert.equal(safeReturnPath(path), '/jobs');
  }
});
test('identifies protected screens without locking public job search', () => {
  assert.equal(requiresSession('/jobs'), false);
  assert.equal(requiresSession('/admin/users'), true);
  assert.equal(requiresSession('/profile'), true);
});

import { hasAnyRole } from '../src/services/authPolicy.ts';
test('requires matching roles and normalizes Spring authorities', () => {
  assert.equal(hasAnyRole(['USER'], ['ADMIN']), false);
  assert.equal(hasAnyRole(['ROLE_EMPLOYER'], ['EMPLOYER']), true);
  assert.equal(hasAnyRole([], ['USER']), false);
});
