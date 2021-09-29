import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { deleteTestResult } from '../application/delete-test-result-service';

import { error, warn, debug, bootstrapLogging } from '@dvsa/mes-microservice-common/application/utils/logger';
import { NoDeleteWarning } from '../domain/NoDeleteWarning';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  bootstrapLogging('delete-test-history', event);
  await bootstrapConfig();
  try {
    await deleteTestResult();
  } catch (err) {
    if (err instanceof NoDeleteWarning) {
      warn('No Test Result Records Deleted Warning - ');
      return createResponse(
                { message: `Failed to delete Test Result Records` },
                HttpStatus.NOT_FOUND,
            );
    }
    error('Error while deleting Test History - ');
    return createResponse(
            { message: `Error deleting Test History:` }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}
