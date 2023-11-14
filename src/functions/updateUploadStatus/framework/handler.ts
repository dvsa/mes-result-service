import { APIGatewayProxyEvent } from 'aws-lambda';
import { get } from 'lodash';
import { error, warn, bootstrapLogging } from '@dvsa/mes-microservice-common/application/utils/logger';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { isNullOrBlank } from '../../postResult/framework/handler';
import { updateUpload } from '../application/update-upload-service';
import { InconsistentUpdateError } from '../domain/InconsistentUpdateError';
import { SubmissionOutcome } from '../domain/SubmissionOutcome';
import { getAppRefFromPathParameters } from '../../../common/application/utils/getPathParms';

export async function handler(event: APIGatewayProxyEvent) {
  bootstrapLogging('update-upload-status', event);
  await bootstrapConfig();

  let body: SubmissionOutcome;
  const appRefPathParam = getAppRefFromPathParameters(event);

  if (isNullOrBlank(event.body) || isNullOrBlank(appRefPathParam)) {
    return createResponse({ message: 'Empty path app-ref or request body' }, HttpStatus.BAD_REQUEST);
  }

  const appRef: number = parseInt(appRefPathParam, 10);
  if (isNaN(appRef)) {
    return createResponse(
      { message: `Error application reference is NaN: ${appRefPathParam}` }, HttpStatus.BAD_REQUEST);
  }

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    error('Failure parsing request body', event.body);
    return createResponse({ message: 'Error parsing request body into JSON' }, HttpStatus.BAD_REQUEST);
  }

  try {
    await updateUpload(appRef, body);
  } catch (err) {
    if (err instanceof InconsistentUpdateError) {
      warn('InconsistentUpdateError - ', ...enrichError(err, appRef, body));
      return createResponse(
        { message: `Failed to update a single record for application reference ${appRef}` },
        HttpStatus.NOT_FOUND,
      );
    }
    error('Error while updating upload status - ' , ...enrichError(err, appRef, body));
    return createResponse(
      { message: `Error updating the status in UUS of Reference Number: ${appRef}` }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}

function enrichError(err: any, applicationReference: number, body: SubmissionOutcome) {
  return {
    ...err,
    applicationReference,
    uploadStatus: get(body, 'state'),
    retryCount: get(body, 'retry_count'),
    errorMessage: get(body, 'error_message'),
    staffNumber: get(body, 'staff_number'),
    uploadInterface: get(body, 'interface'),
  };
}
