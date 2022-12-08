// import * as mysql from 'mysql2';
//
// export const deleteTestResultRecord = (): string => {
//   const template = 'DELETE FROM TEST_RESULT WHERE test_date <= DATE_ADD(NOW(), INTERVAL -2 YEAR)';
//   const args = [];
//
//   return mysql.format(template, args);
// };
//
// export const deleteUploadQueueRecord = (): string => {
//   const template = 'DELETE FROM UPLOAD_QUEUE WHERE timestamp <= DATE_ADD(NOW(), INTERVAL -2 YEAR)';
//   const args = [];
//
//   return mysql.format(template, args);
// };
