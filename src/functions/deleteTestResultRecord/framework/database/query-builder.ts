import * as mysql from 'mysql2';

// @ts-ignore
export const deleteTestResultRecord = (): string => {
  const template = `
  DELETE FROM TEST_RESULT WHERE test_date <= DATE_ADD(NOW(), INTERVAL -2 YEAR)`;
  const args = [];

  return mysql.format(template, args);
};