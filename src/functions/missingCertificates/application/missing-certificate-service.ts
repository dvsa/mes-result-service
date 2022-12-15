import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { countCertificates } from '../framework/database/query-builder';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';

export const duplicateCertificates = async (): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    const [missingCertificatesStep1] = await connection.promise().query(countCertificates());
    info('info message goes here');
    //
    // const [uploadQueueDeleted] = await connection.promise().query(deleteUploadQueueRecord());
    // info('No of UPLOAD_QUEUE records Deleted: ', uploadQueueDeleted.affectedRows);
    //
    // if (testResultDeleted.affectedRows === 0 || uploadQueueDeleted.affectedRows === 0) {
    //   throw new NoDeleteWarning();
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
