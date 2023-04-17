import { APIGatewayEvent, Context } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import Response from '../../../common/application/api/Response';
import { getRegeneratedEmails } from './repositories/get-regenerated-emails-repository';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import createResponse from '../../../common/application/utils/createResponse';
import * as joi from 'joi';
import { gzipSync } from 'zlib';
import { RegeneratedEmailsRecord } from '../../../common/domain/regenerated-emails';
import { bootstrapLogging, info, error } from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  bootstrapLogging('regenerated-emails-service', event);

  try {
    await bootstrapConfig();

    const appRefPathParam = parseInt(event?.pathParameters['appRef'], 10);

    const parametersSchema = joi.number().max(1000000000000);
    const validationResult = parametersSchema.validate(appRefPathParam);

    if (validationResult.error) {
      error(`Invalid application reference provided ${appRefPathParam}`);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    info(`Searching for regenerated emails for application reference: ${appRefPathParam}`);
    const results: RegeneratedEmailsRecord = await getRegeneratedEmails(appRefPathParam);
    const result: RegeneratedEmailsRecord = { ...results[0] };

    if (result.appRef === null) {
      info(`No regenerated emails found for app ref: ${appRefPathParam}`);
      return createResponse('No records found matching criteria', HttpStatus.BAD_REQUEST);
    }

    const compressedPayload = gzipSync(JSON.stringify(result)).toString('base64');
    info(`Found ${result?.emailRegenerationDetails?.length} record(s) for app ref: ${appRefPathParam}`);
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Something went wrong');
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
