import * as mysql from 'mysql2';
import {
  buildMarkTestProcessedQuery,
  buildUpdateErrorsToRetryQuery,
  buildAbortTestsExceeingRetryQuery,
  buildManualInterventionUpdateQuery,
  buildDeleteAcceptedQueueRowsQuery,
} from '../framework/database/query-builder';
import { IRetryProcessor } from './IRetryProcessor';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';

export class RetryProcessor implements IRetryProcessor {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async processSuccessful(): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildMarkTestProcessedQuery());
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking test results as successfully submitted', err.messsage);
    }
  }
  async processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().
        query(buildUpdateErrorsToRetryQuery(
          rsisRetryCount,
          notifyRetryCount,
          tarsRetryCount,
        ));
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as ready for retry', err.message);
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildAbortTestsExceeingRetryQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as aborted', err.message);
    }
  }

  async processSupportInterventions(): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildManualInterventionUpdateQuery());
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught updating records marked for reprocess by manual intervention', err.message);
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildDeleteAcceptedQueueRowsQuery(cutOffPointInDays));
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught processing old upload queue record cleanup', err.message);
    }
  }

}
