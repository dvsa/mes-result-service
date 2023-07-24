import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { identifyCertificates } from './repository/missing-certificate-repository';
import { Books, Certificates } from '../../../common/domain/certificates';
import {
  findMissingCerts,
} from '../application/certificate-service';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  try {
    bootstrapLogging('get-missing-pass-certificates', event);
    await bootstrapConfig();

    const certificates: Certificates[] = await identifyCertificates();

    if (certificates.length === 0) {
      return createResponse(
        { message: 'No records found' }, HttpStatus.NOT_FOUND);
    }

    const response: Books[] = findMissingCerts(certificates);

    return createResponse(response, HttpStatus.OK);
  } catch (err) {
    error(`ERROR - ${err.message} - `, 'something went wrong');
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}