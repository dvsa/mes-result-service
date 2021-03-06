import { APIGatewayEvent, Context } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import Response from '../../../common/application/api/Response';
import { getResult } from './repositories/get-result-repository';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import createResponse from '../../../common/application/utils/createResponse';
import joi from '@hapi/joi';
import { TestResultRecord } from '../../../common/domain/test-results';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { gzipSync } from 'zlib';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  try {
    const appRefPathParam = parseInt(event.pathParameters['app-ref'], 10);
    const staffNumberParam = event.pathParameters['staff-number'];

    const parametersSchema = joi.object().keys({
      staffNumber: joi.string().alphanum(),
      appRef: joi.number().max(1000000000000),
    });

    const validationResult =
      joi.validate({
        staffNumber: staffNumberParam,
        appRef: appRefPathParam,
      },           parametersSchema);

    if (validationResult.error) {
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const result: TestResultRecord[] = await getResult(appRefPathParam);

    const results: TestResultSchemasUnion[] = result.map(row => row.test_result);

    if (results.length === 0) {
      return createResponse('No records found matching criteria', HttpStatus.BAD_REQUEST);
    }

    if (results.length > 1) {
      console.log(`More than one record found for URL params (${appRefPathParam}, ${staffNumberParam})`);
      return createResponse('More than one record found, internal error', HttpStatus.BAD_REQUEST);
    }

    const compressedPayload = gzipSync(JSON.stringify(results[0])).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
