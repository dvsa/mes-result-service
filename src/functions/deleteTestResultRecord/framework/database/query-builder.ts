import * as mysql from 'mysql2';

// @ts-ignore
export const deleteTestResultRecord = (body: any): string => {
  let retryCount: number;
  let errorMessage: string | null;

  const template = `
  DELETE FROM TEST_RESULT WHERE test_date <= DATE_ADD(NOW(), INTERVAL -2 YEAR)`;
  retryCount = body.retry_count;
  errorMessage = body.error_message;

  const args = [
    retryCount,
    errorMessage,
  ];

  return mysql.format(template, args);
};
