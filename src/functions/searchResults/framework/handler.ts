import { APIGatewayEvent } from 'aws-lambda';
import {bootstrapLogging, debug, error, info} from '@dvsa/mes-microservice-common/application/utils/logger';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { getConciseSearchResults } from './repositories/search-repository';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { getEmployeeIdFromRequestContext } from '../../../common/application/utils/getEmployeeId';
import { TestResultRecord } from '../../../common/domain/test-results';
import { UserRole } from '../../../common/domain/user-role';
import { dePermittedQueries, ldtmPermittedQueries } from '../domain/permitted-queries';
import { QueryParamValidator } from '../application/validate-query-params';
import { SearchResultsParams } from '../application/construct-query-params';
import { TestResultMapper } from '../application/map-test-results';
import { isSearchingForOwnTests } from '../application/own-test-check';

export async function handler(event: APIGatewayEvent): Promise<Response> {
  try {
    bootstrapLogging('search-test-results', event);

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    await bootstrapConfig();

    const queryParameters = new SearchResultsParams(event.queryStringParameters).get();
    if (Object.keys(queryParameters).length === 0) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const validationResult = new QueryParamValidator(queryParameters).getResult();
    if (validationResult.error) {
      error('Validation error', validationResult.error);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const isLDTM = event.requestContext.authorizer.examinerRole === UserRole.LDTM;

    const isDLG = event.requestContext.authorizer.examinerRole === UserRole.DLG;

    const staffNumber: string = getEmployeeIdFromRequestContext(event.requestContext);

    const searchingForOwnTest = isSearchingForOwnTests(queryParameters, staffNumber);

    debug('Searching using', queryParameters);

    debug('Searching as', event.requestContext.authorizer.examinerRole);

    // This is to be safe, in case new parameters are added for DE only in the future
    if (isDLG || isLDTM || searchingForOwnTest) {
      for (const key in queryParameters) {
        if (!ldtmPermittedQueries.includes(key)) {
          const role = isLDTM ? 'LDTM' : 'User searching for own test';
          error(`${role} is not permitted to use the parameter ${key}`);
          return createResponse(`${role} is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
    } else if (!isLDTM && !isDLG) {
      for (const key in queryParameters) {
        if (!dePermittedQueries.includes(key)) {
          error(`DE is not permitted to use the parameter ${key}`);
          return createResponse(`DE is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
      queryParameters.staffNumber = staffNumber;
    }

    const results: TestResultRecord[] = await getConciseSearchResults(queryParameters);

    const condensedTestResult = new TestResultMapper(results).format();

    info('Number of test results returning ', results.length);

    return createResponse(condensedTestResult, HttpStatus.OK);
  } catch (err) {
    error('Search results', err);
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
