import { APIGatewayProxyEvent } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { identifyDuplicateCertificates } from '../application/duplicate-certificate-service';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {

  try {
    bootstrapLogging('identify duplicate pass certificates', event);
    await bootstrapConfig();

    const response = await identifyDuplicateCertificates();

    return createResponse(response, HttpStatus.CREATED);
  } catch (err) {
    error(`ERROR - ${err.message} - `, 'something went wrong');
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
