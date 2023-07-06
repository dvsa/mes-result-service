import * as mysql from 'mysql2';
import { getConnection } from '../../../../common/framework/mysql/database';
import { getPassCertificates } from '../database/query-builder';
import { Certificates } from '../../../../common/domain/certificates';

export const identifyCertificates = async (): Promise<Certificates[]> => {
  const connection: mysql.Connection = getConnection();
  let certificates;
  try {
    const [rows, fields] = await connection.promise().query(
      getPassCertificates(),
    );
    console.log('rows', rows);
    certificates = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return certificates;
};
