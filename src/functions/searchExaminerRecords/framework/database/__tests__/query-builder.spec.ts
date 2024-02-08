import { getExaminerRecordsFromSearchQuery } from '../query-builder';
import { queryParameter } from './query-builder.spec.data';
import { QueryParameters } from '../../../domain/query_parameters';

describe('QueryBuilder', () => {
  describe('getExaminerRecordsFromSearchQuery', () => {
    it('should order the results by Desc', () => {
      const result = getExaminerRecordsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(/ORDER BY test_date DESC/);
    });
    it('should have the correct staffNumber in the SELECT', () => {
      const result = getExaminerRecordsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.staffNumber, 'g'));
    });
    it('should have the correct startDate in the SELECT', () => {
      const result = getExaminerRecordsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.startDate, 'g'));
    });
    it('should have the correct endDate in the SELECT', () => {
      const result = getExaminerRecordsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.endDate, 'g'));
    });
  });
});
