import * as mysql from 'mysql2';

export const countCertificates = (): string => {
  const template = 'SELECT COUNT(*) FROM TEST_RESULT';
  const args = [];

  return mysql.format(template, args);
};
