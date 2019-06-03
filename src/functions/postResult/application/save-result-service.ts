import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { ResultIntegration } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';

export const saveTestResult = async (testResult: StandardCarTestCATBSchema): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  const testResultInsert = buildTestResultInsert(testResult);
  const uploadQueueInsertTars = buildUploadQueueInsert(testResult, ResultIntegration.TARS);
  const uploadQueueInsertRsis = buildUploadQueueInsert(testResult, ResultIntegration.RSIS);
  const uploadQueueInsertNotify = buildUploadQueueInsert(testResult, ResultIntegration.NOTIFY);

  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err);
      }
      connection.query(testResultInsert, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueInsertTars, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueInsertRsis, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
      });
      connection.query(uploadQueueInsertNotify, (err) => {
        if (err) {
          return connection.rollback(() => reject(err));
        }
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => reject(err));
          }
          resolve();
        });
      });
    });
  });
};
