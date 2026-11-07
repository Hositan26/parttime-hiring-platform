import test from 'node:test';
import assert from 'node:assert/strict';
import { adminNavigation, adminGroup } from '../src/services/adminNavigation.ts';

test('admin navigation has seven groups and preserves tab destinations', () => {
  assert.equal(adminNavigation.length, 7);
  assert.equal(new Set(adminNavigation.map(item => item.group)).size, 7);
  for (const [path, group] of [['users','accounts'], ['employers','accounts'], ['reports','moderation'], ['reviews','moderation'], ['categories','catalog'], ['shifts','catalog']]) {
    assert.equal(adminGroup(`/admin/${path}`), group);
  }
});
