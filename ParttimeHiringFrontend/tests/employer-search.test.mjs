import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesEmployerSearch } from '../src/services/employerSearch.ts';

test('matches candidate, job, or store names without case or accent sensitivity', () => {
  const fields = ['Đỗ Minh', 'Pha chế', 'Chi nhánh Huế'];
  for (const query of [' do minh ', 'PHA CHE', 'Huế', ' ']) {
    assert.equal(matchesEmployerSearch(query, ...fields), true);
  }
  assert.equal(matchesEmployerSearch('Hà Nội', ...fields), false);
  assert.equal(matchesEmployerSearch('Huế', null, undefined), false);
});
