import { getSearchResultQuery } from '../query-builder';
import { queryParameter, queryParameterRekey } from './query-builder.spec.data';
import { QueryParameters } from '../../../domain/query_parameters';

describe('QueryBuilder', () => {
  let result: string;

  describe('getSearchResultQuery', () => {
    beforeEach(() => {
      result = getSearchResultQuery(queryParameter as QueryParameters).replace(/\s+/g, ' ');
    });
    it('should build a valid SELECT statement', () => {
      expect(result).toMatch(/SELECT \* FROM TEST_RESULT/);
    });
    it('should limit the results by 200', () => {
      expect(result).toMatch(/LIMIT 200/);
    });
    it('should have the correct staffNumber in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.staffNumber, 'g'));
    });
    it('should have the correct driverNumber in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.driverNumber, 'g'));
    });
    it('should have the correct startDate in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.startDate, 'g'));
    });
    it('should have the correct endDate in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.endDate, 'g'));
    });
    it('should have the correct applicationReference in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.applicationReference.toString(), 'g'));
    });
    it('should have the correct DTCCode in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.dtcCode, 'g'));
    });
    it('should have the correct activityCode in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.activityCode, 'g'));
    });
    it('should have the correct category in the SELECT', () => {
      expect(result).toMatch(new RegExp(queryParameter.category, 'g'));
    });
    it('should change query to a sub query when rekey is provided', () => {
      const result = getSearchResultQuery(queryParameterRekey).replace(/\s+/g, ' ');
      // subquery
      expect(result).toMatch(/SELECT TR.test_result FROM \( SELECT \* FROM TEST_RESULT/);
      // rekey filter
      expect(result).toMatch(/JSON_EXTRACT \(TR.test_result, "\$.rekey"\) = true/);
    });
  });
});
