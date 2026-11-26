import { validateExaminerRecordsSchema } from '../validate-request';
import { ExaminerRecordsQueryParameters } from '../../domain/query_parameters';

describe('Validate request', () => {
  describe('validateExaminerRecordsSchema', () => {
    it('should return error if startDate is missing', () => {
      const qp = new ExaminerRecordsQueryParameters();

      qp.endDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp, '1');

      expect(res.error).not.toBeNull();
    });
    it('should return error if endDate is missing', () => {
      const qp = new ExaminerRecordsQueryParameters();

      qp.startDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp, '1');

      expect(res.error).not.toBeNull();
    });
    it('should return error if staffNumber is missing', () => {
      const qp = new ExaminerRecordsQueryParameters();

      qp.startDate = '1111-11-11';
      qp.endDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp, undefined);

      expect(res.error).not.toBeNull();
    });
    it('should not return error if all fields are present', () => {
      const qp = new ExaminerRecordsQueryParameters();

      qp.startDate = '1111-11-11';
      qp.endDate = '1111-11-11';

      const res = validateExaminerRecordsSchema(qp, '1');

      expect(res.error).toEqual(undefined);
    });
  });
});
