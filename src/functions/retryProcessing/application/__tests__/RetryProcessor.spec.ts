
import { retryProcessor, dbSetup, db } from './database-setup';

describe('retryProcessor database test', async () => {
  dbSetup().then(() => {
    console.log('database initialised');
  });

  // before all to ensure only run once per describe

  it('should run processSuccessful and check TEST_RESULT has a status of 2 (PROCESSED)', async () => {
    await retryProcessor.processSuccessful();
    await checkProcessSuccessfulUpdatedTestResult();
  });

  it('should run processErrorsToRetry and check that UPLOAD QUEUE rows are set to 0 (PROCESSING)', async () => {
    await retryProcessor.processErrorsToRetry(3, 3, 3);
    await checkErrorsToRetryUpdatedUpLoadQueues();
  });

  it('should run processErrorsToAbort and check that TEST result has been set to 4 (ERROR)', async () => {
    await retryProcessor.processErrorsToAbort(3, 3, 3);
    await checkErrorsToAbortUpdatedTestResult();
  });

  it('should run processSupportInterventions and check that TEST result and UPLOAD QUEUEs set correctly', async () => {
    await retryProcessor.processSupportInterventions();
    await checkSupportInterventionUpdatedUploadQueues();
    await checkSupportInterventionUpdatedTestResult();
  });

  it('should run processOldEntryCleanup and check that UPLOAD_QUEUES have been deleted correctly', async () => {
    await retryProcessor.processOldEntryCleanup(30);
    await checkOldEntryCleanupDeleteUploadQueues();
  });

});

const checkProcessSuccessfulUpdatedTestResult = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT * FROM TEST_RESULT WHERE application_reference = 1
      and staff_number = '1234' and result_status = 2
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        resolve();
      });
  });
};

const checkErrorsToRetryUpdatedUpLoadQueues = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 2
      and staff_number = '1234' and upload_status = 0
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        if (row.rowcount && row.rowcount !== 3) {
          reject('Row count does not match expected (3)');
        }
        resolve();
      });
  });
};

const checkErrorsToAbortUpdatedTestResult = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT *  FROM TEST_RESULT WHERE application_reference = 3
      and staff_number = '1234'
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        if (row.result_status && row.result_status !== 4) {
          reject('result status Row count does not match expected (4)');
        }
        resolve();
      });
  });
};

const checkSupportInterventionUpdatedUploadQueues = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 4
      and staff_number = '1234' and upload_status = 0
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        if (row.rowcount && row.rowcount !== 3) {
          reject('Row count does not match expected (3)');
        }
        resolve();
      });
  });
};

const checkSupportInterventionUpdatedTestResult = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT * FROM TEST_RESULT WHERE application_reference = 4
      and staff_number = '1234' and result_status = 1
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        resolve();
      });
  });
};

const checkOldEntryCleanupDeleteUploadQueues = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 5
      and staff_number = '1234'
      `,
      [],
      (err, row) => {
        if (err || !row) {
          reject('Row not found or incorrect state');
        }
        if (row.rowcount && row.rowcount !== 0) {
          reject('Row count does not match expected (0)');
        }
        resolve();
      });
  });
};
