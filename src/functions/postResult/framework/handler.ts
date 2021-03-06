import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { decompressTestResult } from '../application/decompression-service';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { saveTestResult } from '../application/save-result-service';
import { TestResultDecompressionError } from '../domain/errors/test-result-decompression-error';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { validateMESJoiSchema } from '../domain/mes-joi-schema-service';
import { verifyRequest } from '../application/jwt-verification-service';
import * as logger from '../../../common/application/utils/logger';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  let testResult: TestResultSchemasUnion;

  let isPartialTestResult = false;
  if (event.queryStringParameters && event.queryStringParameters['partial']
    && event.queryStringParameters['partial'].toLowerCase() === 'true') {
    isPartialTestResult = true;
  }

  await bootstrapConfig();

  try {
    if (isNullOrBlank(event.body)) {
      return createResponse({ message: `Error: Null or blank request body` }, HttpStatus.BAD_REQUEST);
    }
    testResult = decompressTestResult(event.body as string);
  } catch (err) {
    if (err instanceof TestResultDecompressionError) {
      console.error(`Could not decompress test result body ${event.body}`);
      return createResponse({ message: 'The test result body could not be decompressed' }, HttpStatus.BAD_REQUEST);
    }
    console.error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    if (!verifyRequest(event, getStaffIdFromTest(testResult))) {
      return createResponse({ message: 'EmployeeId and staffId do not match' }, HttpStatus.UNAUTHORIZED);
    }
  }

  try {
    const validationResult = validateMESJoiSchema(testResult);

    if (validationResult.error) {
      // Validation error thrown with no action possible by examiner - save results in error state - return HTTP 201
      // to prevent app stalling at 'upload pending'.
      console.error(`Could not validate the test result body ${validationResult.error}`);
      await saveTestResult(testResult, true, isPartialTestResult);
      return createResponse({}, HttpStatus.CREATED);
    }

    await saveTestResult(testResult, false, isPartialTestResult);
  } catch (err) {
    console.error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}

export const isNullOrBlank = (body: string | null): boolean => {
  return body === null || body === undefined || body.trim().length === 0;
};

export const getStaffIdFromTest = (test: TestResultSchemasUnion): string => {
  if (test && test.examinerKeyed) {
    return test.examinerKeyed.toString();
  }
  logger.warn('No staffId found in the test data');
  return null;
};
