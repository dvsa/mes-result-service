import {validateExaminerRecordsSchema} from '../validate-request';
import {QueryParameters} from '../../../searchResults/domain/query_parameters';

describe('Validate request', () => {
  describe('getExaminerRecordsSchema', () => {
    it('should return error if startDate is missing', () => {
      const qp = new QueryParameters();

      qp.endDate = '1111-11-11';
      qp.staffNumber = '1';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
    it('should return error if endDate is missing', () => {
      const qp = new QueryParameters();

      qp.startDate = '1111-11-11';
      qp.staffNumber = '1';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
    it('should return error if staffNumber is missing', () => {
      const qp = new QueryParameters();

      qp.startDate = '1111-11-11';
      qp.endDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });
    it('should not return error if all fields are present', () => {
      const qp = new QueryParameters();

      qp.staffNumber = '1';
      qp.startDate = '1111-11-11';
      qp.endDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).toEqual(undefined);
    });
  });
});