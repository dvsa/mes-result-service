import { APIGatewayProxyEvent } from 'aws-lambda';
import { bootstrapLogging, debug, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { deleteTestResult } from '../application/delete-test-result-service';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {
  try {
    bootstrapLogging('delete-test-result', event);

    debug('Invoking lambda');

    await bootstrapConfig();

    info('Calling deleteTestResult');

    await deleteTestResult();

    return createResponse({}, HttpStatus.OK);
  } catch (err) {
    error('DeleteTestResult', err);
    return createResponse('Error deleting', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
