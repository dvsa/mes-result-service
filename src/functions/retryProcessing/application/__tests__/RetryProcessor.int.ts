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
    it('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED');
      expect(changedRowCount).toBe(1);
      expect(acceptedTestAppRefs).toContain(9);
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
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

    it('should abort TEST_RESULT records that have exceeded the retry count for any interface', async () => {
      const changedRowCount = await retryProcessor.processErrorsToAbort(3, 3, 3);
      const erroredTestAppRefs = await getErroredTestAppRefs();

      expect(changedRowCount).toBe(7);
      expect(erroredTestAppRefs).toContain(24);
      expect(erroredTestAppRefs).toContain(25);
      expect(erroredTestAppRefs).toContain(26);
      expect(erroredTestAppRefs).toContain(27);
      expect(erroredTestAppRefs).toContain(28);
      expect(erroredTestAppRefs).toContain(29);
      expect(erroredTestAppRefs).toContain(30);
    });

    it('should update TEST_RESULT and UPLOAD_QUEUE to make them ready for reprocessing', async () => {
    });

    it('should clean out old UPLOAD_QUEUE records', async () => {
    });
  });

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

  const getErroredTestAppRefs = (): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT DISTINCT tr.application_reference
        FROM TEST_RESULT tr
        JOIN UPLOAD_QUEUE uq
          ON tr.application_reference = uq.application_reference
          AND result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'ERROR')
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

});
