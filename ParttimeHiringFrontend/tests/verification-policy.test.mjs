import test from 'node:test';
import assert from 'node:assert/strict';
import { rejectionMessage } from '../src/services/verificationPolicy.ts';

test('shows the rejection reason only for rejected applications', () => {
  assert.equal(rejectionMessage('REJECTED', '  Giấy tờ bị mờ  '), 'Giấy tờ bị mờ');
  assert.equal(rejectionMessage('APPROVED', 'old reason'), null);
  assert.equal(rejectionMessage('PENDING', 'old reason'), null);
  assert.ok(rejectionMessage('REJECTED', null).length > 0);
});
