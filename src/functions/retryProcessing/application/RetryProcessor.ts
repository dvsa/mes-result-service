import * as mysql from 'mysql2';
import {
  buildMarkTestProcessedQuery,
  buildUpdateErrorsToRetryQuery,
  buildAbortTestsExceeingRetryQuery,
  buildManualInterventionUpdateQuery,
  buildDeleteAcceptedQueueRowsQuery,
} from '../framework/database/query-builder';
import { IRetryProcessor } from './IRetryProcessor';
import { warn, customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

export class RetryProcessor implements IRetryProcessor {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async processSuccessful(): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildMarkTestProcessedQuery());
      const changedRowCount = rows.changedRows;
      customMetric(
        'ResultsSuccessfullyProcessedRowsChanged',
        'The amount of TEST_RESULT records updated to SUCCESSFUL status',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking test results as successfully submitted', err.messsage);
    }
  }
  async processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().
        query(buildUpdateErrorsToRetryQuery(
          rsisRetryCount,
          notifyRetryCount,
          tarsRetryCount,
        ));
      const changedRowCount = rows.changedRows;
      customMetric(
        'InterfacesQueuedForRetryRowsChanged',
        'The amount of UPLOAD_QUEUE records updated back to PROCESSING status for retry',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as ready for retry', err.message);
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildAbortTestsExceeingRetryQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));
      const changedRowCount = rows.changedRows;
      customMetric(
        'ResultsAbortedRowsChanged',
        'The amount of TEST_RESULT records moved to the ERROR status',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as aborted', err.message);
    }
  }

  async processSupportInterventions(): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildManualInterventionUpdateQuery());
      const changedRowCount = rows.changedRows;
      customMetric(
        'InterventionRequeueRowsChanged',
        'The number of TEST_RESULT+UPLOAD_QUEUE records updated as part of reprocessing manual intervention',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback();
      warn('Error caught updating records marked for reprocess by manual intervention', err.message);
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildDeleteAcceptedQueueRowsQuery(cutOffPointInDays));
      const deletedRowCount = rows.affectedRows;
      customMetric(
        'UploadQueueCleanupRowsChanged',
        'The number of UPLOAD_QUEUE records deleted due to being successful and older than the threshold',
        deletedRowCount,
      );
      await this.connection.promise().commit();
      return deletedRowCount;
    } catch (err) {
      this.connection.rollback();
      warn('Error caught processing old upload queue record cleanup', err.message);
    }
  }

}
