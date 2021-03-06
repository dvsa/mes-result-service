import { APIGatewayEvent, AuthResponseContext, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { getConciseSearchResults } from './repositories/search-repository';
import { bootstrapConfig } from '../../../common/framework/config/config';
import joi from '@hapi/joi';
import { QueryParameters } from '../domain/query_parameters';
import { SearchResultTestSchema } from '@dvsa/mes-search-schema/index';
import { getEmployeeIdFromRequestContext } from '../../../common/application/utils/getEmployeeId';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { TestResultRecord } from '../../../common/domain/test-results';
import { UserRole } from '../../../common/domain/user-role';
import { formatApplicationReference } from '@dvsa/mes-microservice-common/domain/tars';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  try {
    const queryParameters: QueryParameters = new QueryParameters();

    if (!event.queryStringParameters) {
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    // Set the parameters from the event to the queryParameter holder object
    // Todo move all IF statements to a common shared method
    if (event.queryStringParameters.startDate) {
      queryParameters.startDate = event.queryStringParameters.startDate;
    }
    if (event.queryStringParameters.endDate) {
      queryParameters.endDate = event.queryStringParameters.endDate;
    }
    if (event.queryStringParameters.driverNumber) {
      queryParameters.driverNumber = event.queryStringParameters.driverNumber;
    }
    if (event.queryStringParameters.staffNumber) {
      queryParameters.staffNumber = event.queryStringParameters.staffNumber;
    }
    if (event.queryStringParameters.dtcCode) {
      queryParameters.dtcCode = event.queryStringParameters.dtcCode;
    }
    if (event.queryStringParameters.applicationReference) {
      queryParameters.applicationReference = event.queryStringParameters.applicationReference;
    }
    if (event.queryStringParameters.excludeAutoSavedTests) {
      queryParameters.excludeAutoSavedTests = event.queryStringParameters.excludeAutoSavedTests === 'true' ?
        'true' : 'false';
    }

    if (Object.keys(queryParameters).length === 0) {
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const parametersSchema = joi.object().keys({
      startDate: joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).optional()
        .label('Please provide a valid date with the format \'YYYY-MM-DD\''),
      endDate: joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).optional()
        .label('Please provide a valid date with the format \'YYYY-MM-DD\''),
      driverId: joi.string().alphanum().max(16).optional(),
      staffNumber: joi.number().optional(),
      dtcCode: joi.string().alphanum().optional(),
      appRef: joi.number().max(1000000000000).optional(),
      excludeAutoSavedTests: joi.string().optional(),
    });

    const validationResult =
      joi.validate({
        driverId: queryParameters.driverNumber,
        staffNumber: queryParameters.staffNumber,
        dtcCode: queryParameters.dtcCode,
        appRef: queryParameters.applicationReference,
        startDate: queryParameters.startDate,
        endDate: queryParameters.endDate,
        excludeAutoSavedTests: queryParameters.excludeAutoSavedTests,
      },           parametersSchema);

    if (validationResult.error) {
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const ldtmPermittedQueries = [
      'startDate', 'staffNumber', 'endDate', 'driverNumber',
      'dtcCode', 'applicationReference', 'excludeAutoSavedTests',
    ];

    const dePermittedQueries = ['driverNumber', 'applicationReference', 'excludeAutoSavedTests'];

    const dlgPermittedQueries = ['driverNumber', 'applicationReference', 'excludeAutoSavedTests'];

    const isLDTM = event.requestContext.authorizer.examinerRole === UserRole.LDTM;

    const isDLG = event.requestContext.authorizer.examinerRole === UserRole.DLG;

    const staffNumber: string = getEmployeeIdFromRequestContext(event.requestContext);

    const searchingForOwnTest = isSearchingForOwnTests(queryParameters, staffNumber);

    // This is to be safe, incase new parameters are added for DE only in the future
    if (isLDTM || searchingForOwnTest) {
      for (const key in queryParameters) {
        if (!ldtmPermittedQueries.includes(key)) {
          const role = isLDTM ? 'LDTM' : 'User searching for own test';
          return createResponse(`${role} is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
    } else if (isDLG) {
      for (const key in queryParameters) {
        if (!dlgPermittedQueries.includes(key)) {
          return createResponse(`DLG is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
    } else if (!isLDTM && !isDLG) {
      for (const key in queryParameters) {
        if (!dePermittedQueries.includes(key)) {
          return createResponse(`DE is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
      queryParameters.staffNumber = staffNumber;
    }

    const result: TestResultRecord[] = await getConciseSearchResults(queryParameters);

    const results: TestResultSchemasUnion[] = result.map(row => row.test_result);
    const condensedTestResult: SearchResultTestSchema[] = [];

    for (const testResultRow of results) {
      const appRef = testResultRow.journalData.applicationReference;
      condensedTestResult.push(
        {
          costCode: testResultRow.journalData.testCentre.costCode,
          testDate: testResultRow.journalData.testSlotAttributes.start,
          driverNumber: testResultRow.journalData.candidate.driverNumber,
          candidateName: testResultRow.journalData.candidate.candidateName,
          applicationReference: formatApplicationReference(appRef),
          category: testResultRow.category,
          activityCode: testResultRow.activityCode,
        },
      );
    }

    return createResponse(condensedTestResult, HttpStatus.OK);
  } catch (err) {
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }

}

const isSearchingForOwnTests = (queryParameters: QueryParameters, staffNumber: string): boolean => {
  return queryParameters && queryParameters.staffNumber === staffNumber;
};
