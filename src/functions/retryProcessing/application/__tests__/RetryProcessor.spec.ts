
import { retryProcessor, dbSetup, db } from './database-setup';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';

describe('retryProcessor database test', () => {

  beforeAll(async () => {
    await dbSetup();
    console.log('database initialised');
  });

  describe('Query correctness', () => {
    it('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      await retryProcessor.processSuccessful();
      await checkProcessSuccessfulUpdatedTestResult();
      await checkProcessSuccessfulUpdatedTerminatedTestResult();
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they have failed but not exceeded the retry limit', async () => {
      await retryProcessor.processErrorsToRetry(3, 3, 3);
      await checkErrorsToRetryUpdatedUpLoadQueues();
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

  describe('Error handling', () => {
    let connectionSpy;
    let realRetryProcessor: IRetryProcessor;
    beforeEach(() => {
      connectionSpy = {
        promise: () => jasmine.createSpyObj('promise', ['query', 'commit']),
        rollback: jasmine.createSpy('rollback'),
      };
      realRetryProcessor = new RetryProcessor(connectionSpy);
    });
    describe('processSuccessful', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processSuccessful();
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processErrorsToRetry', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processErrorsToRetry(5, 5, 5);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processErrorsToAbort', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processErrorsToAbort(5, 5, 5);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processSupportInterventions', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processSupportInterventions();
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processOldEntryCleanup', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processOldEntryCleanup(7);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
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

const checkProcessSuccessfulUpdatedTerminatedTestResult = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT * FROM TEST_RESULT WHERE application_reference = 6
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
