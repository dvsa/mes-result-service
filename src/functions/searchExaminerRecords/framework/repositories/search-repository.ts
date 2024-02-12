import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';
import { ExaminerRecordModel } from '@dvsa/mes-microservice-common/domain/examiner-records';
import { getExaminerRecordsFromSearchQuery } from '../database/query-builder';

export const getExaminerRecords = async (
  queryParameters: QueryParameters,
): Promise<ExaminerRecordModel[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      getExaminerRecordsFromSearchQuery(queryParameters),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
