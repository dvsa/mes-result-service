import { ResultStatus } from '../../../../common/domain/result-status';
import * as mysql from 'mysql2';
import { IntegrationType } from '../../domain/result-integration';
import { ProcessingStatus } from '../../../../common/domain/processing-status';
import { formatApplicationReference } from '@dvsa/mes-microservice-common/domain/tars';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

export const buildTestResultInsert = (
  test: TestResultSchemasUnion,
  isError: boolean = false,
  isPartialTest: boolean): string => {
  const template = `
  INSERT INTO TEST_RESULT (
    application_reference,
    staff_number,
    test_result,
    test_date,
    tc_id,
    tc_cc,
    driver_number,
    driver_surname,
    activity_code,
    category,
    pass_certificate_number,
    result_status,
    autosave
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    test_result = ?,
    autosave = false
  `;

  const { journalData } = test;
  const applicationReference = formatApplicationReference(journalData.applicationReference);
  const { staffNumber } = journalData.examiner;
  const testResult = JSON.stringify(test);
  const testDate = new Date(journalData.testSlotAttributes.start);
  const testCentreId = journalData.testCentre.centreId;
  const testCentreCostCode = journalData.testCentre.costCode;
  const { driverNumber } = journalData.candidate;
  const driverSurname = journalData.candidate.candidateName.lastName;
  const activityCode = test.activityCode;
  const category = test.category;
  const passCertificateNumber = test?.passCompletion?.passCertificateNumber;

  const args = [
    applicationReference,
    staffNumber,
    testResult,
    testDate,
    testCentreId,
    testCentreCostCode,
    driverNumber,
    driverSurname,
    activityCode,
    category,
    passCertificateNumber,
    isError ? ResultStatus.ERROR : ResultStatus.PROCESSING,
    isPartialTest,
    testResult,
  ];

  // Specify that dates should be serialised in UTC.
  return mysql.format(template, args, false, 'UTC');
};

export const buildUploadQueueInsert = (test: TestResultSchemasUnion, integration: IntegrationType): string => {
  const template = `
    INSERT INTO UPLOAD_QUEUE (
      application_reference,
      staff_number,
      timestamp,
      interface,
      upload_status,
      retry_count
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      application_reference = ?
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
    ProcessingStatus.PROCESSING,
    retryCount,
    applicationReference,
  ];
  return mysql.format(template, args);
};
