import { getConnection } from '../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import {
  buildSuccessfullyProcessedQuery,
  buildErrorsToRetryQuery,
  buildErrorsToAbortQuery,
  buildSupportInterventionQuery,
  buildQueueRowsToDeleteQuery,
  buildUpdateTestResultStatusQuery,
  buildUpdateQueueLoadStatusQuery,
  buildUpdateQueueLoadStatusAndRetryCountQuery,
  buildDeleteQueueRowsQuery,
} from '../framework/database/query-builder';
import { getRetryConfig, retryConfig } from '../framework/retryConfig';
import { IRetryProcessor } from './IRetryProcessor';

export class RetryProcessor implements IRetryProcessor {

  async processRetries(): Promise<void> {
    await getRetryConfig();
    await this.processSuccessful();
    await this.processErrorsToRetry(
      retryConfig().rsisRetryCount,
      retryConfig().notifyRetryCount,
      retryConfig().tarsRetryCount,
    );

    await this.processErrorsToAbort(
      retryConfig().rsisRetryCount,
      retryConfig().notifyRetryCount,
      retryConfig().tarsRetryCount,
    );

    await this.processSupportInterventions();
    await this.processOldEntryCleanup(retryConfig().retryCutOffPointDays);
  }

  async processSuccessful(): Promise<void> {
    const connection: mysql.Connection = getConnection();
    try {
      const [rows] = await connection.promise().query(buildSuccessfullyProcessedQuery());

      for (const row of rows) {
        const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'PROCESSED',
        ));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }
  async processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().
        query(buildErrorsToRetryQuery(
          rsisRetryCount,
          notifyRetryCount,
          tarsRetryCount,
        ));

      for (const row of rows) {
        const [updated] = await connection.promise().query(buildUpdateQueueLoadStatusQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
          'FAILED',
          'PROCESSING',
        ));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().query(buildErrorsToAbortQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));

      for (const row of rows) {
        const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'ERROR',
        ));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }

  async processSupportInterventions(): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().query(buildSupportInterventionQuery());

      for (const row of rows) {
        const [queueUpdated] = await connection.promise().query(buildUpdateQueueLoadStatusAndRetryCountQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
          'FAILED',
          'PROCESSING',
          0,
        ));

        const [resultUpdated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'PROCESSING',
        ));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().query(buildQueueRowsToDeleteQuery(cutOffPointInDays));

      for (const row of rows) {
        const [deleted] = await connection.promise().query(buildDeleteQueueRowsQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
        ));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }

}
