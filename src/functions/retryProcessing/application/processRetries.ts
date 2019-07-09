import { getConnection } from '../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import {
    buildSuccessfullyProcessedQuery,
    buildErrorsToRetryQuery,
    buildErrorsToAbortQuery,
    buildSupportInterventionQuery,
    buildQueueRowsToDeleteQuery,
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
    const [rows, fields] = await connection.promise().query(buildSuccessfullyProcessedQuery());
    // TODO process rows and call subsequent query
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
    const [rows, fields] = await connection.promise().
    query(buildErrorsToRetryQuery(retryConfig().rsisRetryCount,
                                  retryConfig().notifyRetryCount,
                                  retryConfig().tarsRetryCount));
    // TODO process rows and call subsequent query
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
    const [rows, fields] = await connection.promise().query(buildErrorsToAbortQuery(
      retryConfig().rsisRetryCount,
      retryConfig().rsisRetryCount,
      retryConfig().tarsRetryCount,
    ));
      // TODO process rows and call subsequent query
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
    const [rows, fields] = await connection.promise().query(buildSupportInterventionQuery());
      // TODO process rows and call subsequent query
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
    const [rows, fields] = await connection.promise().query(buildQueueRowsToDeleteQuery(cutOffPointInDays));
        // TODO process rows and call subsequent query
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
