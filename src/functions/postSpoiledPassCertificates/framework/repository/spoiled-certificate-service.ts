import * as mysql from 'mysql2';
import { getConnection } from '../../../../common/framework/mysql/database';
import { insertSpoiledCertQuery } from '../database/query-builder';
import { SpoiledCertsQueryParameters } from '../../domain/query_parameters';

export const postSpoiledCertificates = async (
  queryParameters : SpoiledCertsQueryParameters,
)=> {
  const connection: mysql.Connection = getConnection();
  try {
    await connection.promise().query(
      insertSpoiledCertQuery(queryParameters),
    );
  } catch (err) {
    connection.rollback(null);
    throw err;
  } finally {
    connection.end();
  }
};
