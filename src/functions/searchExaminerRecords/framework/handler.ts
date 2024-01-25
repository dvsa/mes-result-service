import {APIGatewayEvent} from 'aws-lambda';
import {bootstrapLogging, debug, error} from '@dvsa/mes-microservice-common/application/utils/logger';
import {bootstrapConfig} from '../../../common/framework/config/config';
import {QueryParameters} from '../../searchResults/domain/query_parameters';
import {createResponse} from '@dvsa/mes-microservice-common/application/api/create-response';
import {HttpStatus} from '@dvsa/mes-microservice-common/application/api/http-status';
import {
  validateExaminerRecordsSchema,
} from '../application/validate-request';
import {TestResultRecord} from '../../../common/domain/test-results';
import {getConciseSearchResults} from '../../searchResults/framework/repositories/search-repository';
import {serialiseError} from '../../../common/application/utils/serialise-error';
import * as process from 'process';
import {gzipSync} from 'zlib';
import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {ExaminerRecordModel, formatForExaminerRecords} from '@dvsa/mes-microservice-common/domain/examiner-records';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('search-examiner-records', event);

    await bootstrapConfig();

    debug('Config bootstrapped');

    const queryParameters: QueryParameters = new QueryParameters();

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const allowedQueries = ['startDate', 'endDate', 'staffNumber'];

    for (const key in event.queryStringParameters) {
      if (!allowedQueries.includes(key)) {
        error(`Not permitted to use the parameter ${key}`);
        return createResponse(`Not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
      }
    }

    // Set the parameters from the event to the queryParameter holder object
    if (event.queryStringParameters.startDate) queryParameters.startDate = event.queryStringParameters.startDate;
    if (event.queryStringParameters.endDate) queryParameters.endDate = event.queryStringParameters.endDate;
    if (event.queryStringParameters.staffNumber) queryParameters.staffNumber = event.queryStringParameters.staffNumber;

    if (Object.keys(queryParameters).length === 0) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    debug('Validating request');

    const { error: joiError } = validateExaminerRecordsSchema(queryParameters);

    if (joiError) {
      error('Validation error', joiError);
      return createResponse(joiError, HttpStatus.BAD_REQUEST);
    }

    debug('Validating passed');

    const result: TestResultRecord[] = await getConciseSearchResults(queryParameters, false);

    debug(`Results found for payload size of ${process.env.LIMIT}`);

    console.log('result', result);

    const format: ExaminerRecordModel[] = result.map((value: TestResultRecord) => {
      return formatForExaminerRecords(value.test_result as TestResultSchemasUnion);
    });

    return createResponse(gzipSync(JSON.stringify(format)).toString('base64'), HttpStatus.OK);
  } catch (err) {
    error('Unknown error', serialiseError(err));
    return createResponse('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
