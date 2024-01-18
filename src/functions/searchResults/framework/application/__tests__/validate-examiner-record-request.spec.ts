import {validateExaminerRecordsSchema} from '../validate-examiner-record-request';
import {QueryParameters} from '../../../domain/query_parameters';

describe('Validate request', () => {
  describe('getExaminerRecordsSchema', () => {
    it('should return error if staffNumber is not present', () => {
      const qp = new QueryParameters();

      qp.startDate = '01/01/1111';
      qp.endDate = '02/01/1111';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
    it('should return error if startDate is not present', () => {
      const qp = new QueryParameters();

      qp.staffNumber = 'test';
      qp.endDate = '02/01/1111';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
    it('should return error if endDate is not present', () => {
      const qp = new QueryParameters();

      qp.staffNumber = 'test';
      qp.startDate = '02/01/1111';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
  });
});
