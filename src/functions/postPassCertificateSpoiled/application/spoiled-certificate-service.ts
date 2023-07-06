import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { insertSpoiledCertQuery } from '../framework/database/query-builder';
import { SpoiledCertsQueryParameters } from '../domain/query_parameters';

export const postSpoiledCertificates = async (
  queryParameters : SpoiledCertsQueryParameters,
): Promise<any[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      insertSpoiledCertQuery(queryParameters),
    );
    console.log('rows', rows);
    batch = rows;
  } catch (err) {
    connection.rollback(null);
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
