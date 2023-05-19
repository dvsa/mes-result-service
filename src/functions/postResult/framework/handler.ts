import { APIGatewayProxyEvent } from 'aws-lambda';
import { bootstrapLogging, error, warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { get } from 'lodash';

import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { decompressTestResult } from '../application/decompression-service';
import { saveTestResult } from '../application/save-result-service';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { validateMESJoiSchema } from '../domain/mes-joi-schema-service';
import { verifyRequest } from '../application/jwt-verification-service';

export async function handler(event: APIGatewayProxyEvent): Promise<Response> {
  bootstrapLogging('post-result', event);

  let testResult: TestResultSchemasUnion;
  let isPartialTestResult = false;

  const partial = get(event.queryStringParameters, 'partial', 'false');
  if (partial?.toLowerCase() === 'true') {
    isPartialTestResult = true;
  }

  // Validate DB credentials
  try {
    await bootstrapConfig();
  } catch (err) {
    error('bootstrapConfig', err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // Validate post body existence and format
  try {
    if (isNullOrBlank(event.body)) {
      error('Null or blank request body');
      return createResponse({ message: 'Error: Null or blank request body' }, HttpStatus.BAD_REQUEST);
    }

    testResult = decompressTestResult(event.body as string);
  } catch (err) {
    error(`Could not decompress test result body ${event.body}`);
    return createResponse({ message: 'The test result body could not be decompressed' }, HttpStatus.BAD_REQUEST);
  }

  // Validate staff number
  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    const staffIdFromTest = getStaffIdFromTest(testResult);

    if (!verifyRequest(event, staffIdFromTest)) {
      error('EmployeeId and staffId do not match', { staffIdFromTest });
      return createResponse({ message: 'EmployeeId and staffId do not match' }, HttpStatus.UNAUTHORIZED);
    }
  }

  // Validate against schema
  try {
    const validationResult = validateMESJoiSchema(testResult);
    let hasValidationError: boolean = false;

    if (validationResult.error) {
      // Validation error thrown with no action possible by examiner - save results in error state - return HTTP 201
      // to prevent app stalling at 'upload pending'.
      hasValidationError = true;
      error('Could not validate the test result body', validationResult.error.message, validationResult.value);
    }

    await saveTestResult(testResult, hasValidationError, isPartialTestResult);
    return createResponse({}, HttpStatus.CREATED);

  } catch (err) {
    error('Internal server error', err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export const isNullOrBlank = (body: string | null): boolean => {
  return body === null || body === undefined || body.trim().length === 0;
};

export const getStaffIdFromTest = (test: TestResultSchemasUnion): string => {
  if (test && test.examinerKeyed) {
    return test.examinerKeyed.toString();
  }
  warn('No staffId found in the test data');
  return null;
};
