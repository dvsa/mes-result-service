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

export const processRetries = async (): Promise<void> => {

  try {
    await getRetryConfig();
    await processSuccessful();
    await processErrorsToRetry();
    await processErrorsToAbort();
    await processSupportInterventions();
    await processOldEntryCleanup(retryConfig().retryCutOffPointDays);
  } catch (err) {
    throw err;
  }
};

const processSuccessful = async(): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    const [rows] = await connection.promise().query(buildSuccessfullyProcessedQuery());

    // using for as foreach does not work with await - it just continues
    for (let i = 0, len = rows.length; i < len; i = i + 1) {
      const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
          rows[i].application_reference,
          rows[i].staff_number,
          'PROCESSING',
          'ACCEPTED'));
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};

const processErrorsToRetry = async(): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  try {
    const [rows] = await connection.promise().
    query(buildErrorsToRetryQuery(retryConfig().rsisRetryCount,
                                  retryConfig().notifyRetryCount,
                                  retryConfig().tarsRetryCount));

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
};

const processErrorsToAbort = async(): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  try {
    const [rows] = await connection.promise().query(buildErrorsToAbortQuery(
      retryConfig().rsisRetryCount,
      retryConfig().rsisRetryCount,
      retryConfig().tarsRetryCount,
    ));

    // using for as foreach does not work with await - it just continues
    for (let i = 0, len = rows.length; i < len; i = i + 1) {
      const [updated] = await connection.promise().query(buildUpdateTestResultStatusQuery(
        rows[i].application_reference,
        rows[i].staff_number,
        'PROCESSING',
        'ERROR'));
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};

const processSupportInterventions = async(): Promise<void> => {

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
        'PENDING',
        'PROCESSING'));
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};

const processOldEntryCleanup = async(cutOffPointInDays: number): Promise<void> => {
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
};
