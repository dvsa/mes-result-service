import * as mysql from 'mysql2';
import { IBatchRepository } from './batch-repository-interface';
import { getConnection } from '../../../../common/framework/mysql/database';
import { buildTarsNextBatchQuery } from '../database/query-builder';
import { TestResultRecord } from '../../../../common/domain/test-results';

export class BatchRepository implements IBatchRepository {

  async getUploadQueueData(batchSize: number, interfaceType: string): Promise<TestResultRecord[]> {
    const connection: mysql.Connection = getConnection();
    let batch: mysql.RowDataPacket[];
    try {
      const [rows] = await connection.promise().query<mysql.RowDataPacket[]>(
        buildTarsNextBatchQuery(batchSize, interfaceType),
      );
      batch = rows;
    } catch (err) {
      connection.rollback(null);
      throw err;
    } finally {
      connection.end();
    }
    return batch as TestResultRecord[];
  }
}
