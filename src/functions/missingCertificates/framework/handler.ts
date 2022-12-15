import { APIGatewayProxyEvent } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { duplicateCertificates } from '../application/missing-certificate-service';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {

  console.log('missing certificate');
  bootstrapLogging('identify duplicate certificates', event);

  try {
    await bootstrapConfig();
    await duplicateCertificates();
    const response = '';
    return createResponse(response, HttpStatus.CREATED);
  } catch (err) {
    error(`ERROR - ${err.message} - `, 'something here');
    return createResponse(
      { message: `Error trying something` },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
