import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { TestResultRecord } from '../../../../common/domain/test-results';
import { getConciseSearchResultsFromSearchQuery } from '../database/query-builder';
import { QueryParameters } from '../../domain/query_parameters';

export const getConciseSearchResults = async (
  queryParameters : QueryParameters,
  limit: number = 200,
): Promise<TestResultRecord[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      getConciseSearchResultsFromSearchQuery(queryParameters, limit),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
