import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { TestResultRecord } from '../../../../common/domain/test-results';
import { getConciseSearchResultsFromSearchQuery } from '../database/query-builder';
import { QueryParameters } from '../../domain/query_parameters';
import {ExaminerRecordModel} from '@dvsa/mes-microservice-common/domain/examiner-records';

export const getConciseSearchResults = async (
  queryParameters : QueryParameters,
  limitResults: boolean = true,
): Promise<TestResultRecord[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      getConciseSearchResultsFromSearchQuery(queryParameters, limitResults),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
export const getExaminerRecords = async (
  queryParameters : QueryParameters,
  limitResults: boolean = true,
): Promise<ExaminerRecordModel[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      getConciseSearchResultsFromSearchQuery(queryParameters, limitResults, true),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
