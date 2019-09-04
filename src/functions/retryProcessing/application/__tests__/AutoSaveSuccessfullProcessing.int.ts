import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';

describe('Autosave successful processing operations', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 1234,
    });
    retryProcessor = new RetryProcessor(db);
  });

  it('should not update autosaved test results in the processing state as proce', async () => {
    await retryProcessor.processSuccessful();
    const autosaveQueueRecords = await getAutosaveQueueRecords(db);
    const autosaveTestRecords = await getAutosaveTestResultRecords();

    // assert UPLOAD_QUEUE records have not changed
    expect(autosaveQueueRecords).toContain({ application_reference: 56, interface: 0, upload_status: 0 });
    expect(autosaveQueueRecords).toContain({ application_reference: 56, interface: 1, upload_status: 0 });
    expect(autosaveQueueRecords).toContain({ application_reference: 57, interface: 0, upload_status: 1 });
    expect(autosaveQueueRecords).toContain({ application_reference: 57, interface: 1, upload_status: 0 });
    expect(autosaveQueueRecords).toContain({ application_reference: 58, interface: 0, upload_status: 0 });
    expect(autosaveQueueRecords).toContain({ application_reference: 58, interface: 1, upload_status: 1 });
    expect(autosaveQueueRecords).toContain({ application_reference: 59, interface: 0, upload_status: 1 });
    expect(autosaveQueueRecords).toContain({ application_reference: 59, interface: 1, upload_status: 1 });

    // assert TEST_RESULT records have not changed
    expect(autosaveTestRecords).toContain({ application_reference: 56, result_status: 0 });
    expect(autosaveTestRecords).toContain({ application_reference: 57, result_status: 0 });
    expect(autosaveTestRecords).toContain({ application_reference: 58, result_status: 0 });
    expect(autosaveTestRecords).toContain({ application_reference: 59, result_status: 0 });
  });

  interface TestResultInterface {
    application_reference: number;
    result_status: number;
  }

  const getAutosaveTestResultRecords = (): Promise<TestResultInterface> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference, result_status FROM TEST_RESULT
        WHERE autosave = 1;
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row =>
            ({
              application_reference: row.application_reference,
              result_status: row.result_status,
            })));
        });
    });
  };
});

interface UploadQueueInterface {
  application_reference: number;
  interface: number;
  upload_status: number;
}

export const getAutosaveQueueRecords = (db: mysql.Connection): Promise<UploadQueueInterface[]> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT tr.application_reference, uq.interface, uq.upload_status FROM TEST_RESULT tr
      LEFT JOIN UPLOAD_QUEUE uq ON tr.application_reference = uq.application_reference
      WHERE tr.autosave = 1;
      `,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(results.map(row =>
          ({
            application_reference: row.application_reference,
            interface: row.interface,
            upload_status: row.upload_status,
          })));
      });
  });
};
