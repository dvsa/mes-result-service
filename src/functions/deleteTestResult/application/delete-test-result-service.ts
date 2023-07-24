import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { deleteTestResultRecord, deleteUploadQueueRecord } from '../framework/database/query-builder';

export const deleteTestResult = async (): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    const [testResultDeleted] = await connection.promise().query<mysql.ResultSetHeader>(deleteTestResultRecord());
    console.log('testResultDeleted', testResultDeleted);
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
