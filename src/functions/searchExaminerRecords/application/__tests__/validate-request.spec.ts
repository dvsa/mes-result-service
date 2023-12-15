import {ExaminerRole} from '@dvsa/mes-microservice-common/domain/examiner-role';
import {validateExaminerRecordsSchema} from '../validate-request';
import {QueryParameters} from '../../../searchResults/domain/query_parameters';

describe('Validate request', () => {
  describe('getExaminerRecordsSchema', () => {
    it('should return error if not meeting validation', () => {
      const qp = new QueryParameters();

      qp.startDate = 'hello';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).not.toBeNull();
    });

    it('should not require staffNumber for LDTM', () => {
      const qp = new QueryParameters();

      qp.role = ExaminerRole.LDTM;
      qp.startDate = '2023-12-01';
      qp.endDate = '2023-12-05';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).toEqual(undefined);
    });

    it('should require staffNumber for DE', () => {
      const qp = new QueryParameters();

      qp.role = ExaminerRole.DE;
      qp.staffNumber = '1234567';
      qp.startDate = '2023-12-01';
      qp.endDate = '2023-12-05';

      const res = validateExaminerRecordsSchema(qp);

      expect(res.error).toEqual(undefined);
    });
  });
});
