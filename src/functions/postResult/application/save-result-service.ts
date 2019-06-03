import { StandardCarTestCATBSchema, ApplicationReference } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { config } from '../framework/config/config';
import { ResultIntegration } from '../domain/result-integration';
import { ResultStatus } from '../domain/result-status';
import { ProcessingStatus } from '../domain/processing-status';

export const saveTestResult = async (testResult: StandardCarTestCATBSchema): Promise<void> => {
  console.log(`I will save ${JSON.stringify(testResult)}`);
  const configuration = config();
  const connection: mysql.Connection = mysql.createConnection({
    host: configuration.mesDatabaseHostname,
    database: configuration.mesDatabaseName,
    user: configuration.mesDatabaseUsername,
    password: configuration.mesDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : 'Amazon RDS',
    authSwitchHandler(data: any, cb: any) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.mesDatabasePassword}\0`));
      }
    },
  });

  const testResultInsert = buildResultInsertQuery(testResult);
  const uploadQueueQueryTars = buildUploadQueueQuery(testResult, ResultIntegration.TARS);
  const uploadQueueQueryRsis = buildUploadQueueQuery(testResult, ResultIntegration.RSIS);
  const uploadQueueQueryNotify = buildUploadQueueQuery(testResult, ResultIntegration.NOTIFY);

  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
      }
      connection.query(testResultInsert, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueQueryTars, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueQueryRsis, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueQueryNotify, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => reject(err));
          }
          resolve();
        });
      });
    });
  });
};

const buildResultInsertQuery = (test: StandardCarTestCATBSchema): string => {
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

const formatApplicationReference = (appRef: ApplicationReference) => {
  return `${appRef.applicationId}${appRef.bookingSequence}${appRef.checkDigit}`;
};

const buildUploadQueueQuery = (test: StandardCarTestCATBSchema, integration: ResultIntegration): string => {
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
