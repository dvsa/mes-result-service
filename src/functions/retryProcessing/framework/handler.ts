import { ScheduledEvent } from 'aws-lambda';
import * as mysql from 'mysql2';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { RetryProcessor } from '../application/RetryProcessor';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { IRetryProcessor } from '../application/IRetryProcessor';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { IRetryProcessingFacade } from '../domain/IRetryProcessingFacade';
import { RetryProcessingFacade } from '../domain/RetryProcessingFacade';
import { getConnection } from '../../../common/framework/mysql/database';
import { setIsolationLevelSerializable } from './database/query-templates';

export async function handler(event: ScheduledEvent) {
  let connection: mysql.Connection;

  try {
    bootstrapLogging('retry-processor', event);

    await bootstrapConfig();

    connection = getConnection();

    const retryProcessor: IRetryProcessor = new RetryProcessor(connection);

    const retryProcessingFacade: IRetryProcessingFacade = new RetryProcessingFacade(retryProcessor);

    await connection.promise().query(setIsolationLevelSerializable);

    await retryProcessingFacade.processRetries();

    return createResponse({}, HttpStatus.OK);
  } catch (err) {
    error('Uncaught error in handler', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}
