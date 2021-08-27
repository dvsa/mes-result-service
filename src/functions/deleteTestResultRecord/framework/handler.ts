import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { get } from 'lodash';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { isNullOrBlank } from '../../../functions/postResult/framework/handler';
import { deleteTestResult } from '../application/delete-testResult-service';

import { error, warn, debug, bootstrapLogging } from '@dvsa/mes-microservice-common/application/utils/logger';
import { NoDeleteWarning } from '../domain/NoDeleteWarning';
import { SubmissionOutcome } from '../domain/SubmissionOutcome';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  bootstrapLogging('delete-test-history', event);
  await bootstrapConfig();

  let body: SubmissionOutcome;

  if (isNullOrBlank(event.body)) {
    return createResponse({ message: 'Empty request body' }, HttpStatus.BAD_REQUEST);
  }

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    error('Failure parsing request body', body, 'event body', event.body);
    return createResponse({ message: 'Error parsing request body into JSON' }, HttpStatus.BAD_REQUEST);
  }

  try {
    await deleteTestResult(body);
  } catch (err) {
    if (err instanceof NoDeleteWarning) {
      warn('No Records Deleted Warning - ', ...enrichError(err, body));
      return createResponse(
                { message: `Failed to delete Test Result Records` },
                HttpStatus.NOT_FOUND,
            );
    }
    error('Error while deleting Test History - ' , ...enrichError(err, body));
    return createResponse(
            // tslint:disable-next-line:max-line-length
            { message: `Error deleting Test History:` }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}

function enrichError(err: any, body: SubmissionOutcome) {
  return {
    ...err,
    retryCount: get(body, 'retry_count'),
    errorMessage: get(body, 'error_message'),
  };
}
