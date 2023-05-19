import { APIGatewayEvent } from 'aws-lambda';
import {bootstrapLogging, error} from '@dvsa/mes-microservice-common/application/utils/logger';
import { bootstrapConfig } from '../../../common/framework/config/config';
import Response from '../../../common/application/api/Response';
import { getResult } from './repositories/get-result-repository';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import createResponse from '../../../common/application/utils/createResponse';
import * as joi from 'joi';
import { TestResultRecord } from '../../../common/domain/test-results';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { gzipSync } from 'zlib';
import {
  getAppRefFromPathParameters,
  getStaffNumberFromPathParameters,
} from '../../../common/application/utils/getPathParms';

export async function handler(event: APIGatewayEvent): Promise<Response> {
  try {
    bootstrapLogging('get-result', event);

    await bootstrapConfig();

    const appRefPathParam = parseInt(getAppRefFromPathParameters(event), 10);

    const staffNumberParam = getStaffNumberFromPathParameters(event);

    const parametersSchema = joi.object().keys({
      staffNumber: joi.string().alphanum(),
      appRef: joi.number().max(1000000000000),
    });

    const validationResult = parametersSchema.validate({
      staffNumber: staffNumberParam,
      appRef: appRefPathParam,
    });

    if (validationResult.error) {
      error('Validation error', validationResult.error.message, validationResult.value);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const result: TestResultRecord[] = await getResult(appRefPathParam);

    const results: TestResultSchemasUnion[] = result.map(row => row.test_result);

    if (results.length === 0) {
      error('No records found matching criteria');
      return createResponse('No records found matching criteria', HttpStatus.BAD_REQUEST);
    }

    if (results.length > 1) {
      error(`More than one record found for URL params (${appRefPathParam}, ${staffNumberParam})`);
      return createResponse('More than one record found, internal error', HttpStatus.BAD_REQUEST);
    }

    const compressedPayload = gzipSync(JSON.stringify(results[0])).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Unknown error', err);
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
