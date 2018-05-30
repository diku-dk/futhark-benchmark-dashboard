const { getRevisions, getRevisionDate, getRevisionMessage } = require('../find-commit-dates.js');

test('tests getRevisions', () => {
  expect(getRevisions([
    'futhark-opencl-GTX690-e9f295456aab4f38efb8836ffed3c1bbcffbcf70.json',
    'futhark-pyopencl-GTX780-00056d8c0da5e99c1107e0be746a56b73805a1e4.json',
    'futhark-opencl-GTX780-00056d8c0da5e99c1107e0be746a56b73805a1e4.json',
    'futhark-opencl-test-test.json',
  ])).toEqual([
    'e9f295456aab4f38efb8836ffed3c1bbcffbcf70',
    '00056d8c0da5e99c1107e0be746a56b73805a1e4'
  ]);
});

test('tests getRevisionDate with existing hash', () => {
  expect(new Date(getRevisionDate(
    '7afc676095acb726a9201c621bc2c83a167571e7'
  ))).toEqual(
    new Date('2018-05-01 13:50:43 +0200')
  )
});

test('tests getRevisionDate with nonexistent hash', () => {
  expect(getRevisionDate(
    'aaaa676095acb726a9201c621bc2c83a167571e7'
  )).toEqual(
    null
  )
});

test('tests getRevisionMessage with existing hash', () => {
  expect(getRevisionMessage(
    '7afc676095acb726a9201c621bc2c83a167571e7'
  )).toEqual('Some doc fixes.')
});

test('tests getRevisionMessage with nonexistent hash', () => {
  expect(getRevisionMessage(
    'aaaa676095acb726a9201c621bc2c83a167571e7'
  )).toEqual(
    null
  )
});