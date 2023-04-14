import { APIGatewayEvent, Context } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import Response from '../../../common/application/api/Response';
import { getRegeneratedEmails } from './repositories/get-regenerated-emails-repository';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import createResponse from '../../../common/application/utils/createResponse';
import * as joi from 'joi';
import { gzipSync } from 'zlib';
import { RegeneratedEmailsRecord } from '../../../common/domain/regenerated-emails';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  try {
    const appRefPathParam = parseInt(event?.pathParameters['appRef'], 10);

    const parametersSchema = joi.number().max(1000000000000);
    const validationResult = parametersSchema.validate(appRefPathParam);

    if (validationResult.error) {
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const results: RegeneratedEmailsRecord = await getRegeneratedEmails(appRefPathParam);
    const result: RegeneratedEmailsRecord = { ...results[0] };

    if (result.appRef === null) {
      return createResponse('No records found matching criteria', HttpStatus.BAD_REQUEST);
    }

    const compressedPayload = gzipSync(JSON.stringify(result)).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
