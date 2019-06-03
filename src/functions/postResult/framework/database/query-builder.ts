import { StandardCarTestCATBSchema, ApplicationReference } from '@dvsa/mes-test-schema/categories/B';
import { ResultStatus } from '../../domain/result-status';
import * as mysql from 'mysql2';
import { ResultIntegration } from '../../domain/result-integration';
import { ProcessingStatus } from '../../domain/processing-status';

export const buildTestResultInsert = (test: StandardCarTestCATBSchema): string => {
  const template = `
  INSERT INTO TEST_RESULT (
    application_reference,
    staff_number,
    test_result,
    test_date,
    tc_id,
    driver_number,
    driver_surname,
    result_status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const applicationReference = formatApplicationReference(test.journalData.applicationReference);
  const { staffNumber } = test.journalData.examiner;
  const testResult = JSON.stringify(test);
  const testDate = Date.parse(test.journalData.testSlotAttributes.start);
  const testCentreId = 1; // TODO: Get this into the test schema
  const { driverNumber } = test.journalData.candidate;
  const driverSurname = test.journalData.candidate.candidateName.lastName;

  const args = [
    applicationReference,
    staffNumber,
    testResult,
    testDate,
    testCentreId,
    driverNumber,
    driverSurname,
    ResultStatus.ACCEPTED,
  ];

  return mysql.format(template, args);
};

export const buildUploadQueueInsert = (test: StandardCarTestCATBSchema, integration: ResultIntegration): string => {
  const template = `
    INSERT INTO UPLOAD_QUEUE (
      application_reference,
      staff_number,
      timestamp,
      interface,
      upload_status,
      retry_count
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const applicationReference = formatApplicationReference(test.journalData.applicationReference);
  const { staffNumber } = test.journalData.examiner;
  const timestamp = new Date();
  const retryCount = 0;

  const args = [
    applicationReference,
    staffNumber,
    timestamp,
    integration,
    ProcessingStatus.ACCEPTED,
    retryCount,
  ];
  return mysql.format(template, args);
};

const formatApplicationReference = (appRef: ApplicationReference) => {
  return `${appRef.applicationId}${appRef.bookingSequence}${appRef.checkDigit}`;
};
