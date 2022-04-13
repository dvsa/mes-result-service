import { getConciseSearchResultsFromSearchQuery } from '../query-builder';
import { queryParameter, queryParameterNonJson } from './query-builder.spec.data';
import { QueryParameters } from '../../../domain/query_parameters';

describe('QueryBuilder', () => {
  describe('getConciseSearchResultsFromSearchQuery', () => {
    it('should build a valid SELECT statement', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(/SELECT test_result FROM TEST_RESULT/);
    });
    it('should order the results by Desc', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(/ORDER BY test_date DESC/);
    });
    it('should limit the results by 200', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(/LIMIT 200/);
    });
    it('should have the correct staffNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.staffNumber, 'g'));
    });
    it('should have the correct driverNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.driverNumber, 'g'));
    });
    it('should have the correct startDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.startDate, 'g'));
    });
    it('should have the correct endDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.endDate, 'g'));
    });
    it('should have the correct applicationReference in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.applicationReference.toString(), 'g'));
    });
    it('should have the correct DTCCode in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterNonJson as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameterNonJson.dtcCode, 'g'));
    });
    it('should build a valid SELECT statement with a sub query', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toContain('SELECT * FROM (SELECT test_result, test_date FROM TEST_RESULT');
    });
    it('should have an outer where clause with activity code', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toContain('JSON_EXTRACT(test_result, "$.activityCode") = \'2\'');
    });
    it('should have an outer where clause with category', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toContain('JSON_EXTRACT(test_result, "$.category") = \'C\'');
    });

  });
});
