import { deleteTestResultRecord } from '../query-builder';

describe('deleteTestResultRecord query builder', () => {

  let dummyRequestBody: any;

  beforeEach(() => {
    dummyRequestBody = {
      retry_count: 15,
      error_message: '500 Internal Server Error',
    };
  });
  it('should contain DELETE', () => {
    const res = deleteTestResultRecord(dummyRequestBody);
    expect(res).toMatch(/DELETE/);
  });
  it('should contain the correct retry count', () => {
    const res = deleteTestResultRecord(dummyRequestBody);
    expect(res).toMatch(/retry_count = retry_count \+ 15/);
  });
  it('should contain the correct error message', () => {
    const res = deleteTestResultRecord(dummyRequestBody);
    expect(res).toMatch(/error_message = '500 Internal Server Error'/);
  });
});
