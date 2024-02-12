import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';
import { examinerRecordsQuery } from './examinerRecordsQuery';

export const getExaminerRecordsFromSearchQuery = (
  queryParameters: QueryParameters,
): string => {
  const parameterArray: string[] = [queryParameters.startDate, queryParameters.endDate, queryParameters.staffNumber];
  return mysql.format(examinerRecordsQuery, parameterArray);
};
