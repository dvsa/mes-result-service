import { deleteTestResultRecord } from '../query-builder';

describe('deleteTestResultRecord query builder', () => {
  it('should contain DELETE', () => {
    const res = deleteTestResultRecord();
    expect(res).toMatch(/DELETE/);
  });
});
