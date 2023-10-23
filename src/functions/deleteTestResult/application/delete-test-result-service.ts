import * as mysql from 'mysql2';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getConnection } from '../../../common/framework/mysql/database';
import { deleteTestResultRecord, deleteUploadQueueRecord } from '../framework/database/query-builder';

export const deleteTestResult = async (): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    const [testResultDeleted] = await connection.promise().query<mysql.ResultSetHeader>(deleteTestResultRecord());
    info('No of TEST_RESULT records Deleted: ', testResultDeleted.affectedRows);

    const [uploadQueueDeleted] = await connection.promise().query<mysql.ResultSetHeader>(deleteUploadQueueRecord());
    info('No of UPLOAD_QUEUE records Deleted: ', uploadQueueDeleted.affectedRows);
  } catch (err) {
    connection.rollback(null);
    throw err;
  } finally {
    connection.end();
  }
};
