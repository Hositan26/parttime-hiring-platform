import test from 'node:test';
import assert from 'node:assert/strict';
import { employerJobSearchParams, matchesEmployerSearch } from '../src/services/employerSearch.ts';

test('matches candidate, job, or store names without case or accent sensitivity', () => {
  const fields = ['Đỗ Minh', 'Pha chế', 'Chi nhánh Huế'];
  for (const query of [' do minh ', 'PHA CHE', 'Huế', ' ']) {
    assert.equal(matchesEmployerSearch(query, ...fields), true);
  }
  assert.equal(matchesEmployerSearch('Hà Nội', ...fields), false);
  assert.equal(matchesEmployerSearch('Huế', null, undefined), false);
});

test('matches employee, job and store fields when employment details are incomplete', () => {
  assert.equal(matchesEmployerSearch('nguyen', 'Nguyễn Linh', null, 'Hải Châu'), true);
  assert.equal(matchesEmployerSearch('hai chau', 'Nguyễn Linh', null, 'Hải Châu'), true);
  assert.equal(matchesEmployerSearch('phuc vu', 'Nguyễn Linh', 'Phục vụ', 'Hải Châu'), true);
  assert.equal(matchesEmployerSearch('phuc vu', 'Nguyễn Linh', null, 'Hải Châu'), false);
});

test('sends the title keyword together with page and filters', () => {
  const params = employerJobSearchParams(2, 10, 3, 'ACTIVE', ' Pha chế & phục vụ ');
  assert.equal(params.get('keyword'), 'Pha chế & phục vụ');
  assert.equal(params.get('page'), '2');
  assert.equal(params.get('size'), '10');
  assert.equal(params.get('storeId'), '3');
  assert.equal(params.get('status'), 'ACTIVE');
  assert.equal(employerJobSearchParams(0, 10, undefined, undefined, ' ').has('keyword'), false);
});
