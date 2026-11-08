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

test('administration routes reject candidate and employer roles', () => {
  for (const roles of [[], ['USER'], ['EMPLOYER'], ['USER', 'EMPLOYER']]) {
    assert.equal(hasAnyRole(roles, ['ADMIN']), false);
  }
  assert.equal(hasAnyRole(['ADMIN'], ['ADMIN']), true);
  assert.equal(hasAnyRole(['ROLE_ADMIN'], ['ADMIN']), true);
  for (const path of ['/admin', '/admin/users', '/admin/jobs', '/admin/verifications']) {
    assert.equal(requiresSession(path), true);
    assert.equal(safeReturnPath(path), path);
  }
});
