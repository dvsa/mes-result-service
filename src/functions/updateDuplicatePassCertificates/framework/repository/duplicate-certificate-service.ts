import * as mysql from 'mysql2';
import { getConnection } from '../../../../common/framework/mysql/database';
import { duplicateQuery } from '../database/query-builder';

export const identifyDuplicateCertificates = async (
)=> {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      duplicateQuery(),
    );
  } catch (err) {
    connection.rollback(null);
    throw err;
  } finally {
    connection.end();
  }
};
