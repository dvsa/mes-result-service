import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { SpoiledCertsQueryParameters } from '../domain/query_parameters';
import * as joi from 'joi';
import { postSpoiledCertificates } from './repository/spoiled-certificate-service';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  try {
    bootstrapLogging('post-spoiled-pass-certificates', event);

    await bootstrapConfig();

    const queryParameters: SpoiledCertsQueryParameters = new SpoiledCertsQueryParameters();

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    // Set the parameters from the event to the queryParameter holder object
    if (event.queryStringParameters.passCertificateNumber) {
      queryParameters.passCertificateNumber = event.queryStringParameters.passCertificateNumber;
    }
    if (event.queryStringParameters.staffNumber) {
      queryParameters.staffNumber = event.queryStringParameters.staffNumber;
    }
    if (event.queryStringParameters.spoiledDate) {
      queryParameters.spoiledDate = event.queryStringParameters.spoiledDate;
    }
    if (event.queryStringParameters.dtcCode) {
      queryParameters.dtcCode = event.queryStringParameters.dtcCode;
    }
    if (event.queryStringParameters.status) {
      queryParameters.status = event.queryStringParameters.status;
    }
    if (event.queryStringParameters.reason) {
      queryParameters.reason = event.queryStringParameters.reason;
    }

    if (Object.keys(queryParameters).length === 0) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const parametersSchema = joi.object().keys(
      {
        passCertificateNumber: joi.string().optional(),
        staffNumber: joi.string().alphanum().optional(),
        spoiledDate: joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).optional()
          .label('Please provide a valid date with the format \'YYYY-MM-DD\''),
        dtcCode: joi.string().alphanum().optional(),
        status: joi.string().optional(),
        reason: joi.string().optional(),
      });

    const validationResult = parametersSchema.validate(
      {
        passCertificateNumber: queryParameters.passCertificateNumber,
        staffNumber: queryParameters.staffNumber,
        spoiledDate: queryParameters.spoiledDate,
        dtcCode: queryParameters.dtcCode,
        status: queryParameters.status,
        reason: queryParameters.reason,
      });

    if (validationResult.error) {
      error('Validation error', validationResult.error);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    // attempt to insert record
    await postSpoiledCertificates(queryParameters);

    return createResponse('Record Inserted', HttpStatus.CREATED);
  } catch (err) {
    error(`ERROR - ${err.message} - `, 'record not inserted');
    return createResponse(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
