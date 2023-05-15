import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';

export const getConciseSearchResultsFromSearchQuery = (queryParameters: QueryParameters): string => {
  const parameterArray: string[] = [];
  let queries: string[] = [];
  let queryString: string = '';
  let rekeyFlag: boolean = false;

  // Require a staff number to allow rekeyflag to be used
  if (queryParameters?.staffNumber && queryParameters?.rekey === 'true') rekeyFlag = true;

  if (queryParameters.startDate && queryParameters.endDate) {
    queries.push('test_date >= ? AND test_date <= ?');
    parameterArray.push(queryParameters.startDate);
    parameterArray.push(queryParameters.endDate);
  }
  if (queryParameters.driverNumber) {
    queries.push('driver_number = ?');
    parameterArray.push(queryParameters.driverNumber);
  }
  if (queryParameters.dtcCode) {
    queries.push('tc_cc = ?');
    parameterArray.push(queryParameters.dtcCode);
  }
  if (queryParameters.staffNumber) {
    queries.push('staff_number = ?');
    parameterArray.push(queryParameters.staffNumber);
  }

  if (queryParameters.excludeAutoSavedTests === 'true') {
    queries.push('autosave <> 1');
  }

  if (queryParameters.applicationReference) {
    if (queryParameters.applicationReference.toString().length === 8) {
      /*
        Finds appRefs based on 8 digits provided
        Uses range query to find appRefs between those numbers
        Most performant way of implementing the 8 digit app ref search
      */
      queries.push('application_reference >= ? AND application_reference <= ?');
      parameterArray.push(`${queryParameters.applicationReference.toString()}000`);
      parameterArray.push(`${queryParameters.applicationReference.toString()}999`);
    } else {
      queries.push('application_reference = ?');
      parameterArray.push(queryParameters.applicationReference.toString());
    }
  }

  if (queryParameters.activityCode) {
    queries.push('activity_code = ?');
    parameterArray.push(queryParameters.activityCode);
  }

  if (queryParameters.category) {
    queries.push('category = ?');
    parameterArray.push(decodeURIComponent(queryParameters.category));
  }

  if (queryParameters.passCertificateNumber) {
    queries.push('pass_certificate_number = ?');
    parameterArray.push(decodeURIComponent(queryParameters.passCertificateNumber));
  }

  // Add AND between all statements
  queries = [...queries].map((e, i) => i < queries.length - 1 ? [e, 'AND'] : [e])
    .reduce((a, b) => a.concat(b));

  // If rekeyFlag is true then existing query becomes sub query, extracting only tests marked for rekey from the result
  if (rekeyFlag) {
    queryString = queryString.concat('SELECT TR.test_result from (SELECT * FROM TEST_RESULT WHERE ');
  } else {
    queryString = queryString.concat('SELECT test_result FROM TEST_RESULT WHERE ');
  }

  queries.forEach((query) => {
    queryString = queryString.concat(`${query} `);
  });

  // If rekeyFlag apply the filter for rekey first prior to restricting number of records
  if (rekeyFlag) queryString = queryString.concat(') as TR WHERE JSON_EXTRACT(TR.test_result, "$.rekey") = true ');
  queryString = queryString.concat(`ORDER BY ${rekeyFlag ? 'TR.' : ''}test_date DESC LIMIT 200;`);

  return mysql.format(queryString, parameterArray);
};
