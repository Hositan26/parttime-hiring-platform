import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordAllowed, registrationError } from '../src/services/authValidation.ts';
test('matches password policy without truncating Unicode input', () => {
  assert.equal(passwordAllowed('StrongPass123'), true);
  assert.equal(passwordAllowed('short'), false);
  assert.equal(passwordAllowed('🔒'.repeat(30)), false);
});
test('validates usernames, display names and recovery email', () => {
  assert.equal(registrationError('candidate', 'StrongPass123', 'Candidate', 'u@example.com'), '');
  assert.notEqual(registrationError('a!', 'StrongPass123', 'Candidate', 'u@example.com'), '');
  assert.notEqual(registrationError('candidate', 'StrongPass123', ' ', 'u@example.com'), '');
  assert.notEqual(registrationError('candidate', 'StrongPass123', 'Candidate', 'invalid'), '');
});
