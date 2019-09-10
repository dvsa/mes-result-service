import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import {
  getAutosaveQueueRecords,
  getTestResultAppRefsForResultStatus,
  getProcessingUploadQueueRecords,
} from './common/HelperSQLQueries';

describe('SupportIntervention', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 3306,
    });
    retryProcessor = new RetryProcessor(db);
  });

  // AUTOSAVE - FAILED VALIDATION (NO RECORDS CREATED)
  it('should create a new PROCESSING record for TARS & NOTIFY (NOT RSIS) and set result to PROCESSING', async () => {

    await retryProcessor.processSupportInterventions();
    const autosaveRecords = await getAutosaveQueueRecords(db);
    const processingResults = await getTestResultAppRefsForResultStatus('PROCESSING', db);

    // Tests that the correct 2 records were added to the upload queue (no RSIS record)
    expect(autosaveRecords).toContain({ application_reference: 77, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 77, interface: 1, upload_status: 0 });
    expect(autosaveRecords).not.toContain({ application_reference: 77, interface: 2, upload_status: 0 });

    expect(processingResults).toContain(77);
  });

  // FULL SUBMISSION - FAILED VALIDATION (NO RECORDS CREATED)
  it('should create a new record for TARS, NOTIFY & RSIS and set result to PROCESSING (full submission)', async () => {

    await retryProcessor.processSupportInterventions();
    const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
    const processingResults = await getTestResultAppRefsForResultStatus('PROCESSING', db);

    // Tests that the correct 3 records were added to the upload queue (incl. RSIS record)
    expect(processingUploadQueueRecords).toContain({ application_reference: 78, interface: 0 });
    expect(processingUploadQueueRecords).toContain({ application_reference: 78, interface: 1 });
    expect(processingUploadQueueRecords).toContain({ application_reference: 78, interface: 2 });

    expect(processingResults).toContain(78);
  });

  // FULL SUBMISSION - 1 OR MORE INTERFACES FAILED
  it('should set result status PENDING->PROCESSING and set and queue status ERROR->PROCESSING', async () => {

    await retryProcessor.processSupportInterventions();
    const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
    const processingResults = await getTestResultAppRefsForResultStatus('PROCESSING', db);

    // Tests that the upload_queue records are updated correctly ERROR->PROCESSING
    expect(processingUploadQueueRecords).toContain({ application_reference: 79, interface: 2 });

    expect(processingUploadQueueRecords).toContain({ application_reference: 80, interface: 1 });
    expect(processingUploadQueueRecords).toContain({ application_reference: 80, interface: 2 });

    expect(processingUploadQueueRecords).toContain({ application_reference: 81, interface: 0 });
    expect(processingUploadQueueRecords).toContain({ application_reference: 81, interface: 1 });
    expect(processingUploadQueueRecords).toContain({ application_reference: 81, interface: 2 });

    expect(processingUploadQueueRecords).toContain({ application_reference: 82, interface: 2 });

    expect(processingResults).toContain(79);
    expect(processingResults).toContain(80);
    expect(processingResults).toContain(81);
    expect(processingResults).toContain(82);
  });

  // AUTOSAVE - 1 OR MORE INTERFACES FAILED
  it('should set result status PENDING->PROCESSING (with autosave) and set and queue ERROR->PROCESSING', async () => {

    await retryProcessor.processSupportInterventions();
    const autosaveRecords = await getAutosaveQueueRecords(db);
    const processingResults = await getTestResultAppRefsForResultStatus('PROCESSING', db);

    // Tests that the upload_queue records are updated correctly ERROR->PROCESSING
    expect(autosaveRecords).toContain({ application_reference: 83, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 83, interface: 1, upload_status: 0 });
    expect(autosaveRecords).not.toContain({ application_reference: 83, interface: 2, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 84, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 84, interface: 1, upload_status: 0 });
    expect(autosaveRecords).not.toContain({ application_reference: 84, interface: 2, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 85, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 85, interface: 1, upload_status: 1 });
    expect(autosaveRecords).not.toContain({ application_reference: 85, interface: 2, upload_status: 0 });

    expect(processingResults).toContain(83);
    expect(processingResults).toContain(84);
    expect(processingResults).toContain(85);
  });
});
