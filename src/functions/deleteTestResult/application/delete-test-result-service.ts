import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { NoDeleteWarning } from '../domain/NoDeleteWarning';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { deleteTestResultRecord, deleteUploadQueueRecord } from '../framework/database/query-builder';


export const deleteTestResult = async (): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    const [testResultDeleted] = await connection.promise().query(deleteTestResultRecord());
    info('No of TEST_RESULT records Deleted: ',  testResultDeleted.affectedRows);
    const [uploadQueueDeleted] = await connection.promise().query(deleteUploadQueueRecord());
    info('No of UPLOAD_QUEUE records Deleted: ',  uploadQueueDeleted.affectedRows);
    if (testResultDeleted.affectedRows === 0
         || uploadQueueDeleted.affectedRows === 0
  ) {
      throw new NoDeleteWarning();
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
