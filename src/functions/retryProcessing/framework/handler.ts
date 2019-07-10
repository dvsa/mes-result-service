import { APIGatewayEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { processRetries } from '../application/processRetries';
import { bootstrapConfig } from '../../../../src/common/framework/config/config';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {

  await bootstrapConfig();
  try {
    await processRetries();
  } catch (err) {
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
  return createResponse({}, HttpStatus.OK);
}
