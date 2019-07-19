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
import { IRetryProcessor } from './IRetryProcessor';

export class RetryProcessor implements IRetryProcessor {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async processSuccessful(): Promise<void> {
    try {
      const [rows] = await this.connection.promise().query(buildSuccessfullyProcessedQuery());

      for (const row of rows) {
        const [updated] = await this.connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'PROCESSED',
        ));
      }
    } catch (err) {
      this.connection.rollback();
      throw err;
    }
  }
  async processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      const [rows] = await this.connection.promise().
        query(buildErrorsToRetryQuery(
          rsisRetryCount,
          notifyRetryCount,
          tarsRetryCount,
        ));

      for (const row of rows) {
        const [updated] = await this.connection.promise().query(buildUpdateQueueLoadStatusQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
          'FAILED',
          'PROCESSING',
        ));
      }
    } catch (err) {
      this.connection.rollback();
      throw err;
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      const [rows] = await this.connection.promise().query(buildErrorsToAbortQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));

      for (const row of rows) {
        const [updated] = await this.connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'ERROR',
        ));
      }
    } catch (err) {
      this.connection.rollback();
      throw err;
    }
  }

  async processSupportInterventions(): Promise<void> {
    try {
      const [rows] = await this.connection.promise().query(buildSupportInterventionQuery());

      for (const row of rows) {
        const [queueUpdated] = await this.connection.promise().query(buildUpdateQueueLoadStatusAndRetryCountQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
          'FAILED',
          'PROCESSING',
          0,
        ));

        const [resultUpdated] = await this.connection.promise().query(buildUpdateTestResultStatusQuery(
          row.application_reference,
          row.staff_number,
          'PROCESSING',
        ));
      }
    } catch (err) {
      this.connection.rollback();
      throw err;
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<void> {
    try {
      const [rows] = await this.connection.promise().query(buildQueueRowsToDeleteQuery(cutOffPointInDays));

      for (const row of rows) {
        const [deleted] = await this.connection.promise().query(buildDeleteQueueRowsQuery(
          row.application_reference,
          row.staff_number,
          row.interface,
        ));
      }
    } catch (err) {
      this.connection.rollback();
      throw err;
    }
  }

}
