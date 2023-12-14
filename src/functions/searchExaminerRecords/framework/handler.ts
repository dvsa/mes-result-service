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
import {formatForExaminerRecords} from '../application/map-results';
import {serialiseError} from '../../../common/application/utils/serialise-error';
import * as process from 'process';
import {ExaminerRecordModel} from '../domain/examiner-record.model';
import {ExaminerRole} from '@dvsa/mes-microservice-common/domain/examiner-role';

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

    const role = event.requestContext.authorizer.examinerRole as ExaminerRole;

    // Set the parameters from the event to the queryParameter holder object
    if (event.queryStringParameters.startDate) queryParameters.startDate = event.queryStringParameters.startDate;
    if (event.queryStringParameters.endDate) queryParameters.endDate = event.queryStringParameters.endDate;
    if (event.queryStringParameters.staffNumber) queryParameters.staffNumber = event.queryStringParameters.staffNumber;
    if (event.requestContext.authorizer.examinerRole) queryParameters.role = role;

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

    const result: TestResultRecord[] = await getConciseSearchResults(queryParameters, Number(process.env.LIMIT));

    debug(`Results found for payload size of ${process.env.LIMIT}`);

    const format: ExaminerRecordModel[] = result.map(
      ({ test_result }) => formatForExaminerRecords(test_result),
    );

    return createResponse(format, HttpStatus.OK);
  } catch (err) {
    error('Unknown error', serialiseError(err));
    return createResponse('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
