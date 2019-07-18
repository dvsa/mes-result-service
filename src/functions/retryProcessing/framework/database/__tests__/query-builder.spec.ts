import {
  buildErrorsToRetryQuery,
  buildErrorsToAbortQuery,
  buildSupportInterventionQuery,
  buildQueueRowsToDeleteQuery,
  buildUpdateQueueLoadStatusQuery,
  buildUpdateTestResultStatusQuery,
} from '../query-builder';

describe('QueryBuilder', () => {

  describe('buildErrorsToRetryQuery', () => {
    it('should build a valid SELECT query', () => {
      const result = buildErrorsToRetryQuery(9, 9, 9);
      expect(result).toMatch(/SELECT u.application_reference, u.staff_number, u.interface/);
    });

    it('should have the retry count in the SELECT', () => {
      const result = buildErrorsToRetryQuery(9, 9, 9);
      expect(result).toMatch(/AND u.retry_count < 9/);
    });
    it('should have the interface types in the SELECT', () => {
      const result = buildErrorsToRetryQuery(9, 9, 9);
      expect(result).toMatch(/WHERE interface_type_name = 'RSIS'/);
      expect(result).toMatch(/WHERE interface_type_name = 'NOTIFY'/);
      expect(result).toMatch(/WHERE interface_type_name = 'TARS'/);
    });
  });

  describe('buildErrorsToAbortQuery', () => {
    it('should build a valid SELECT query', () => {
      const result = buildErrorsToAbortQuery(9, 9, 9);
      expect(result).toMatch(/SELECT u.application_reference, u.staff_number, u.interface/);
    });

    it('should have the retry count in the SELECT', () => {
      const result = buildErrorsToAbortQuery(9, 9, 9);
      expect(result).toMatch(/AND u.retry_count >= 9/);
    });
    it('should have the interface type in the SELECT', () => {
      const result = buildErrorsToAbortQuery(9, 9, 9);
      expect(result).toMatch(/WHERE interface_type_name = 'RSIS'/);
      expect(result).toMatch(/WHERE interface_type_name = 'NOTIFY'/);
      expect(result).toMatch(/WHERE interface_type_name = 'TARS'/);
    });
  });

  describe('buildSupportInterventionQuery', () => {
    it('should build a valid SELECT query', () => {
      const result = buildSupportInterventionQuery();
      expect(result).toMatch(/SELECT u.application_reference, u.staff_number, u.interface/);
    });
  });

  describe('buildQueueRowsToDeleteQuery', () => {
    it('should build a valid SELECT query', () => {
      const result = buildQueueRowsToDeleteQuery(30);
      expect(result).toMatch(/SELECT application_reference, staff_number, interface/);
    });

    it('should have the cutoffpoint in the SELECT', () => {
      const result = buildQueueRowsToDeleteQuery(30);
      // /AND u.timestamp < \'(9999-99-99 99:99:99`')/
      expect(result).toMatch(/AND u.timestamp < \'\d\d\d\d\-\d\d\-\d\d/);
    });
  });

  describe('buildUpdateQueueLoadStatusQuery', () => {
    it('should build a valid UPDATE query', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/UPDATE UPLOAD_QUEUE/);
    });

    it('should have the uploadStatusNameTo in the UPDATE', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED/);
    });

    it('should have the uploadStatusNameFrom in the UPDATE', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSED'/);
    });

    it('should have the staffNumber in the UPDATE', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/5678/);
    });

    it('should have the applicationReferenceNumber in the UPDATE', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/1234/);
    });

    it('should have the interfaceType in the UPDATE', () => {
      const result = buildUpdateQueueLoadStatusQuery(1234, 5678, 1, 'PROCESSED', 'FAILED');
      expect(result).toMatch(/AND interface = 1/);
    });

  });

  describe('buildUpdateTestResultStatusQuery', () => {
    it('should build a valid UPDATE query', () => {
      const result = buildUpdateTestResultStatusQuery(1234, 5678, 'FAILED');
      expect(result).toMatch(/UPDATE TEST_RESULT/);
    });

    it('should have the uploadStatusNameTo in the UPDATE', () => {
      const result = buildUpdateTestResultStatusQuery(1234, 5678, 'FAILED');
      expect(result).toMatch(/SELECT id FROM RESULT_STATUS WHERE result_status_name = 'FAILED/);
    });

    it('should have the staffNumber in the UPDATE', () => {
      const result = buildUpdateTestResultStatusQuery(1234, 5678, 'FAILED');
      expect(result).toMatch(/5678/);
    });

    it('should have the applicationReferenceNumber in the UPDATE', () => {
      const result = buildUpdateTestResultStatusQuery(1234, 5678, 'FAILED');
      expect(result).toMatch(/1234/);
    });

  });

});
