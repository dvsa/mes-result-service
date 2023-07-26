import * as mysql from 'mysql2';
import {
  buildMarkTestProcessedQuery,
  buildUpdateErrorsToRetryQuery,
  buildAbortTestsExceeingRetryQuery,
  buildDeleteAcceptedQueueRowsQuery,
  buildSelectTestsExceedingRetryQuery,
  buildProcessStalledTestResultsQuery,
} from '../framework/database/query-builder';
import { IRetryProcessor } from './IRetryProcessor';
import { warn, customMetric, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import {
  manualInterventionReprocessUploadQueueQuery,
  manualInterventionUploadQueueReplacementQuery,
  manualInterventionReprocessTestResultQuery,
} from '../framework/database/query-templates';
import { FailedUploadQueueResult } from '../domain/query-results-types';
import { convertInterfaceIdToInterfaceType } from '../domain/interface-types';

export class RetryProcessor implements IRetryProcessor {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async processSuccessful(): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query<mysql.ResultSetHeader>(buildMarkTestProcessedQuery());
      const changedRowCount = rows.changedRows;
      customMetric(
        'ResultsSuccessfullyProcessedRowsChanged',
        'The amount of TEST_RESULT records updated to SUCCESSFUL status',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback(null);
      warn('Error caught marking test results as successfully submitted', err.message);
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
      const changedRowCount = rows['changedRows'];
      customMetric(
        'InterfacesQueuedForRetryRowsChanged',
        'The amount of UPLOAD_QUEUE records updated back to PROCESSING status for retry',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback(null);
      warn('Error caught marking interfaces as ready for retry', err.message);
    }
  }
  async processErrorsToLog(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      const [rows, fields]: [any, any] =
        await this.connection.promise().query(
          buildSelectTestsExceedingRetryQuery(rsisRetryCount, notifyRetryCount, tarsRetryCount),
        );

      rows.forEach((row) => {
        error('A result has reached maximum number of retries', {
          application_reference: row.application_reference,
          staff_number: row.staff_number,
          interface: convertInterfaceIdToInterfaceType(row.interface),
          retry_count: row.retry_count,
          error_message: row.error_message,
        });
      });

      customMetric(
        'ResultsNeedingManualIntervention',
        'The amount of newly processed results which require a manual intervention',
        rows.length,
      );
    } catch (err) {
      warn('Error caught selecting which failed upload queue rows to log', err.message);
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query<mysql.ResultSetHeader>(buildAbortTestsExceeingRetryQuery(
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
      this.connection.rollback(null);
      warn('Error caught marking interfaces as aborted', err.message);
    }
  }

  async processSupportInterventions(): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();

      // Move UPLOAD_QUEUE rows in ERROR and against a PENDING TEST_RESULT back to PROCESSING
      const [uploadQueueStatusRows] = await this.connection.promise()
        .query<mysql.ResultSetHeader>(manualInterventionReprocessUploadQueueQuery);

      // Recreate potentially missing UPLOAD_QUEUE records for PENDING TEST_RESULTs
      const [uploadQueueNewRows] = await this.connection.promise()
        .query<mysql.ResultSetHeader>(manualInterventionUploadQueueReplacementQuery);

      // Move PENDING TEST_RESULTs back to PROCESSING
      const [testResultStatusRows] = await this.connection.promise()
        .query<mysql.ResultSetHeader>(manualInterventionReprocessTestResultQuery);

      const changedRowCount = uploadQueueStatusRows.changedRows
        + uploadQueueNewRows.affectedRows + testResultStatusRows.changedRows;
      customMetric(
        'InterventionRequeueRowsChanged',
        'The number of TEST_RESULT+UPLOAD_QUEUE records updated as part of reprocessing manual intervention',
        changedRowCount,
      );
      await this.connection.promise().commit();
      return changedRowCount;
    } catch (err) {
      this.connection.rollback(null);
      warn('Error caught updating records marked for reprocess by manual intervention', err.message);
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise()
        .query<mysql.ResultSetHeader>(buildDeleteAcceptedQueueRowsQuery(cutOffPointInDays));
      const deletedRowCount = rows.affectedRows;
      customMetric(
        'UploadQueueCleanupRowsChanged',
        'The number of UPLOAD_QUEUE records deleted due to being successful and older than the threshold',
        deletedRowCount,
      );
      await this.connection.promise().commit();
      return deletedRowCount;
    } catch (err) {
      this.connection.rollback(null);
      warn('Error caught processing old upload queue record cleanup', err.message);
    }
  }

  async processStalledTestResults(autosaveCutOffPointInDays: number): Promise<number> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] =
        await this.connection.promise()
          .query<mysql.ResultSetHeader>(buildProcessStalledTestResultsQuery(autosaveCutOffPointInDays));
      const createdRowCount = rows.affectedRows;
      customMetric(
        'UploadQueueRsisRowsChanged',
        'The number of UPLOAD_QUEUE records added due to stale TEST_RESULT autosave data',
        createdRowCount,
      );
      await this.connection.promise().commit();
      return createdRowCount;
    } catch (err) {
      this.connection.rollback(null);
      warn('Error caught creating RSIS records for stale test result records', err.message);
    }
  }
}
