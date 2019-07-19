import * as sqlite3 from 'sqlite3';
import { IRetryProcessor } from '../IRetryProcessor';
import {
  successfullyProcessedQuery,
  getUpdateTestResultStatusQuery,
  errorsToRetryQueryTemplate,
  getUpdateQueueLoadStatusQuery,
  errorsToAbortQueryTemplate,
  supportInterventionQuery,
  getUpdateQueueLoadStatusAndRetryCountQuery,
  getQueueRowsToDeleteQuery,
  getDeleteQueueRowsQuery,
} from '../../framework/database/query-templates';
import moment = require('moment');
import { run, get, all } from './sqlite-helper';

export class TestRetryProcessor implements IRetryProcessor {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async processSuccessful(): Promise<void> {
    const rows: any[] = await all(this.db, successfullyProcessedQuery, []);
    for (const row of rows) {
      await run(this.db, getUpdateTestResultStatusQuery(), [
        'PROCESSED',
        row.application_reference,
        row.staff_number,
      ]);
    }
  }

  async processErrorsToRetry(rsisRetryCount: number, notifyRetryCount: number, tarsRetryCount: number): Promise<void> {
    const rows: any[] = await all(this.db, errorsToRetryQueryTemplate, [
      rsisRetryCount,
      notifyRetryCount,
      tarsRetryCount,
    ]);
    for (const row of rows) {
      await get(this.db, getUpdateQueueLoadStatusQuery(), [
        'PROCESSING',
        row.application_reference,
        row.staff_number,
        row.interface,
        'FAILED',
      ]);
    }
  }

  async processErrorsToAbort(rsisRetryCount: number, notifyRetryCount: number, tarsRetryCount: number): Promise<void> {
    const rows: any[] = await all(this.db, errorsToAbortQueryTemplate, [
      rsisRetryCount,
      notifyRetryCount,
      tarsRetryCount,
    ]);
    for (const row of rows) {
      await get(this.db, getUpdateTestResultStatusQuery(), [
        'ERROR',
        row.application_reference,
        row.staff_number,
      ]);
    }
  }

  async processSupportInterventions(): Promise<void> {
    const rows: any[] = await all(this.db, supportInterventionQuery, []);
    for (const row of rows) {
      await get(this.db, getUpdateQueueLoadStatusAndRetryCountQuery(), [
        'PROCESSING',
        0,
        row.application_reference,
        row.staff_number,
        row.interface,
        'FAILED',
      ]);
      await get(this.db, getUpdateTestResultStatusQuery(), [
        'PROCESSING',
        row.application_reference,
        row.staff_number,
      ]);
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<void> {
    // note we are calculating the date outside of sql so we don't have issues
    // with the various ways different flavours of SQL deal with dates.
    const startDate = moment().subtract(cutOffPointInDays, 'days').format('YYYY-MM-DD HH:mm:ss');

    const rows: any[] = await all(this.db, getQueueRowsToDeleteQuery(), [startDate]);
    for (const row of rows) {
      await get(this.db, getDeleteQueueRowsQuery(), [
        row.application_reference,
        row.staff_number,
        row.interface,
      ]);
    }
  }

}
