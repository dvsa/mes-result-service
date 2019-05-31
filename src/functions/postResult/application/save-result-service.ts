import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { config } from '../framework/config/config';

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
  console.log(`built query ${testResultInsert}`);

  connection.beginTransaction((err) => {
    if (err) {
      throw err;
    }
    connection.query(testResultInsert, (err) => {
      if (err) {
        return connection.rollback(() => { throw err; });
      }
      connection.commit((err) => {
        if (err) {
          return connection.rollback(() => {
            throw err;
          });
        }
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

  const { applicationReference } = test.journalData;
  const { staffNumber } = test.journalData.examiner;
  const testResult = JSON.stringify(test);
  const testDate = Date.parse(test.journalData.testSlotAttributes.start);
  const testCentreId = 1; // TODO: Get this into the test schema
  const { driverNumber } = test.journalData.candidate;
  const driverSurname = test.journalData.candidate.candidateName.lastName;
  const resultStatus = 0; // ACCEPTED;

  const args = [
    applicationReference,
    staffNumber,
    testResult,
    testDate,
    testCentreId,
    driverNumber,
    driverSurname,
    resultStatus,
  ];

  return mysql.format(template, args);
};
