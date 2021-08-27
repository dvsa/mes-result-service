import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { deleteTestResultRecord } from '../framework/database/query-builder';
import { NoDeleteWarning } from '../domain/NoDeleteWarning';
import { SubmissionOutcome } from '../domain/SubmissionOutcome';
import { info } from '@dvsa/mes-microservice-common/application/utils/logger';

export const deleteTestResult = async (body: SubmissionOutcome): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  try {
    const [deleted] = await connection.promise().query(deleteTestResultRecord(body));
    info('No of records Deleted: ',  deleted.affectedRows);
    if (deleted.affectedRows === 0) {
      throw new NoDeleteWarning();
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
