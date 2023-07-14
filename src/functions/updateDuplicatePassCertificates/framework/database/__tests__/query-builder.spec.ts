import { duplicateQuery } from '../query-builder';

describe('QueryBuilder', () => {
  describe('duplicateQuery', () => {
    it('should return the formatted SQL query', () => {

      const actualQuery = duplicateQuery();
      expect(actualQuery).toContain(
        'INSERT INTO DUPLICATE_CERTIFICATES (pass_certificate_number, times_cert_used, test_details)');
      expect(actualQuery).toContain('(SELECT pass_certificate_number');
      expect(actualQuery).toContain(', COUNT(*) as times_cert_used');
      expect(actualQuery).toContain(', CONCAT(\'[\', GROUP_CONCAT(DISTINCT JSON_OBJECT(');
      expect(actualQuery).toContain('\'application_reference\', application_reference');
      expect(actualQuery).toContain(', \'staff_number\', staff_number');
      expect(actualQuery).toContain(', \'test_date\', test_date)');
      expect(actualQuery).toContain('), \']\')   as test_details');
      expect(actualQuery).toContain('FROM TEST_RESULT tr');
      expect(actualQuery).toContain('WHERE tr.pass_certificate_number IS NOT NULL');
      expect(actualQuery).toContain('GROUP BY pass_certificate_number');
      expect(actualQuery).toContain('HAVING times_cert_used > 1)');
      expect(actualQuery).toContain('ON DUPLICATE KEY UPDATE times_cert_used=VALUES(times_cert_used),');
      expect(actualQuery).toContain('test_details=VALUES(test_details)');
    });
  });
});
