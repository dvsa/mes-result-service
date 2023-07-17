import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { identifyDuplicateCertificates } from './repository/duplicate-certificate-service';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  try {
    bootstrapLogging('update-duplicate-pass-certificates', event);
    await bootstrapConfig();

    await identifyDuplicateCertificates();

    return createResponse({}, HttpStatus.CREATED);
  } catch (err) {
    error(`ERROR - ${err.message} - `, 'something went wrong');
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
