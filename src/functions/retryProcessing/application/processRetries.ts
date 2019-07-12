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

    try {
      await getRetryConfig();
      await this.processSuccessful();
      await this.processErrorsToRetry(
        retryConfig().rsisRetryCount,
        retryConfig().notifyRetryCount,
        retryConfig().tarsRetryCount);

      await this.processErrorsToAbort(
        retryConfig().rsisRetryCount,
        retryConfig().notifyRetryCount,
        retryConfig().tarsRetryCount);

      await this.processSupportInterventions();
      await this.processOldEntryCleanup(retryConfig().retryCutOffPointDays);
    } catch (err) {
      throw err;
    }
  }

  async processSuccessful(): Promise<void> {
    const connection: mysql.Connection = getConnection();
    try {
      const [rows] = await connection.promise().query(buildSuccessfullyProcessedQuery());

      // using for as foreach does not work with await - it just continues
      for (let i = 0, len = rows.length; i < len; i = i + 1) {
        const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
            rows[i].application_reference,
            rows[i].staff_number,
            'PROCESSED'));
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
    tarsRetryCount: number): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().
      query(buildErrorsToRetryQuery(rsisRetryCount,
                                    notifyRetryCount,
                                    tarsRetryCount));

      // using for as foreach does not work with await - it just continues
      for (let i = 0, len = rows.length; i < len; i = i + 1) {
        const [updated] = await connection.promise().query(buildUpdateQueueLoadStatusQuery(
            rows[i].application_reference,
            rows[i].staff_number,
            rows[i].interface,
            'FAILED',
            'PROCESSING'));
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
    tarsRetryCount: number): Promise<void> {
    const connection: mysql.Connection = getConnection();

    try {
      const [rows] = await connection.promise().query(buildErrorsToAbortQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));

      // using for as foreach does not work with await - it just continues
      for (let i = 0, len = rows.length; i < len; i = i + 1) {
        const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          rows[i].application_reference,
          rows[i].staff_number,
          'ERROR'));
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

      // using for as foreach does not work with await - it just continues
      for (let i = 0, len = rows.length; i < len; i = i + 1) {
        const [queueUpdated] = await connection.promise().query(buildUpdateQueueLoadStatusAndRetryCountQuery(
          rows[i].application_reference,
          rows[i].staff_number,
          rows[i].interface,
          'FAILED',
          'PROCESSING',
          0));

        const [resultUpdated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          rows[i].application_reference,
          rows[i].staff_number,
          'PROCESSING'));
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

      // using for as foreach does not work with await - it just continues
      for (let i = 0, len = rows.length; i < len; i = i + 1) {
        const [deleted] = await connection.promise().query(buildDeleteQueueRowsQuery(
          rows[i].application_reference,
          rows[i].staff_number,
          rows[i].interface));
      }
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
  }

}
