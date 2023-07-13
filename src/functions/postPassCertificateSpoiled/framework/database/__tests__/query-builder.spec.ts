import { insertSpoiledCertQuery } from '../query-builder';

describe('QueryBuilder', () => {
  describe('insertSpoiledCertQuery', () => {
    it('should return the formatted SQL query with the provided query parameters', () => {
      const queryParameters = {
        passCertificateNumber: 'C111111',
        staffNumber: '123456',
        spoiledDate: '2023-07-13',
        dtcCode: 'DTC001',
        status: '2',
        reason: 'stolen',
      };

      const expectedQuery = `
      INSERT INTO SPOILED_CERTIFICATES (pass_certificate_number, staff_number, spoiled_date, tc_id, status, reason)
      VALUES ('C111111', '123456', '2023-07-13', 'DTC001', '2', 'stolen')`;

      const actualQuery = insertSpoiledCertQuery(queryParameters);
      expect(actualQuery).toEqual(expectedQuery);
    });

  });
});
