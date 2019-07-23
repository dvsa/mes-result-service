import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';

describe('RetryProcessor database test', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
    });
    retryProcessor = new RetryProcessor(db);
  });

  /**
   * See the test data scripts in /spec/infra for the scenarios being tested here.
   */
  describe('Query correctness', () => {
    fit('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED');
      expect(changedRowCount).toBe(1);
      expect(acceptedTestAppRefs).toContain(9);
    });

    fit('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
      const changedRowCount = await retryProcessor.processErrorsToRetry(3, 3, 3);
      const appRefInterfaces = await getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred();

      expect(changedRowCount).toBe(12);
      // TARS
      expect(appRefInterfaces).toContain({ application_reference: 10, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 13, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 14, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 16, interface: 0 });
      // NOTIFY
      expect(appRefInterfaces).toContain({ application_reference: 12, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 14, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 15, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 16, interface: 1 });
      // RSIS
      expect(appRefInterfaces).toContain({ application_reference: 11, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 13, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 15, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 16, interface: 2 });
    });

    it('should abort UPLOAD_QUEUE records that have exceeded the retry count for that interface', async () => {
      await retryProcessor.processErrorsToAbort(3, 3, 3);
      await checkErrorsToAbortUpdatedTestResult();
    });

    it('should update TEST_RESULT and UPLOAD_QUEUE to make them ready for reprocessing', async () => {
      await retryProcessor.processSupportInterventions();
      await checkSupportInterventionUpdatedUploadQueues();
      await checkSupportInterventionUpdatedTestResult();
    });

    it('should clean out old UPLOAD_QUEUE records', async () => {
      await retryProcessor.processOldEntryCleanup(30);
      await checkOldEntryCleanupDeleteUploadQueues();
    });
  });

  const checkErrorsToAbortUpdatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT *  FROM TEST_RESULT WHERE application_reference = 3
        and staff_number = '1234'
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.result_status && results.result_status !== 4) {
            reject('result status Row count does not match expected (4)');
          }
          resolve();
        });
    });
  };

  const checkSupportInterventionUpdatedUploadQueues = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 4
        and staff_number = '1234' and upload_status = 0
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.rowcount && results.rowcount !== 3) {
            reject('Row count does not match expected (3)');
          }
          resolve();
        });
    });
  };

  const checkSupportInterventionUpdatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT * FROM TEST_RESULT WHERE application_reference = 4
        and staff_number = '1234' and result_status = 1
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          resolve();
        });
    });
  };

  const checkOldEntryCleanupDeleteUploadQueues = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 5
        and staff_number = '1234'
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.rowcount && results.rowcount !== 0) {
            reject('Row count does not match expected (0)');
          }
          resolve();
        });
    });
  };

  const getTestResultAppRefsForResultStatus = (resultStatus: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference FROM TEST_RESULT
        WHERE result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = '${resultStatus}')
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => row.application_reference));
        });
    });
  };

  interface AppRefInterface {
    application_reference: number;
    interface: number;
  }

  const getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred = (): Promise<AppRefInterface[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference, interface
        FROM UPLOAD_QUEUE
        WHERE
          retry_count > 0
          AND upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING');
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => ({ application_reference: row.application_reference, interface: row.interface })));
        });
    });
  };

});
