import { Context, ScheduledEvent } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { RetryProcessor } from '../application/RetryProcessor';
import { bootstrapConfig } from '../../../../src/common/framework/config/config';
import { IRetryProcessor } from '../application/IRetryProcessor';
import { error } from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: ScheduledEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  const retryProcessor: IRetryProcessor = new RetryProcessor();
  try {
    await retryProcessor.processRetries();
  } catch (err) {
    error('Uncaught error in handler', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.OK);
}
