import * as mysql from 'mysql2';

export const buildGetResultQuery = (appRef: string, driverNumber: string): string => {
  const template = `
  SELECT TEST_RESULT.test_result
  FROM TEST_RESULT
  WHERE application_ref = ?
  AND driver_number = ?;
 `;

  return mysql.format(template, [appRef, driverNumber]);
};
