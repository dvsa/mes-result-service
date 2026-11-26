import * as mysql from 'mysql2';
import { ExaminerRecordsQueryParameters } from '../../domain/query_parameters';
import { examinerRecordsQuery } from './examinerRecordsQuery';

export const getExaminerRecordsFromSearchQuery = (
  queryParameters: ExaminerRecordsQueryParameters,
  staffNumber: string,
): string => {
  const parameterArray: string[] = [queryParameters.startDate, queryParameters.endDate, staffNumber];
  return mysql.format(examinerRecordsQuery, parameterArray);
};
