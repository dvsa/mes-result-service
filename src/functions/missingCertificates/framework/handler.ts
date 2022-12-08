import { APIGatewayProxyEvent } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {

  await bootstrapConfig();
  console.log('missing certificate');
  // bootstrapLogging('identify duplicate certificates', event);
  // await bootstrapConfig();
  // try {
  //   await duplicateCertificates();
  // } catch (err) {
  //   error('error', err);
  // }
  return createResponse({}, HttpStatus.CREATED);
}
