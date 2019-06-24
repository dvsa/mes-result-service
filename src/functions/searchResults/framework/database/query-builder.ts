import * as mysql from 'mysql2';
import { QueryParameters } from '../../domain/query_parameters';

export const buildDriverDetailsSearchQuery = (queryParameters : QueryParameters): string => {
  const parameterArray = [];
  let queries = [];

  if (queryParameters.startDate && queryParameters.endDate) {
    queries.push('test_date >= ? AND test_date <= ?');
    parameterArray.push(queryParameters.startDate);
    parameterArray.push(queryParameters.endDate);
  }
  if (queryParameters.driverId) {
    queries.push('driver_number = ?');
    parameterArray.push(queryParameters.driverId);
  }
  if (queryParameters.dtcCode) {
    queries.push('json_extract(test_result, \'$.journalData.testCentre.costCode\') = ?');
    parameterArray.push(queryParameters.dtcCode);
  }
  if (queryParameters.staffNumber) {
    queries.push('staff_number = ?');
    parameterArray.push(queryParameters.staffNumber);
  }
  if (queryParameters.appRef) {
    queries.push('application_reference = ?');
    parameterArray.push(queryParameters.appRef);
  }

  // Add AND between all statements
  queries = [...queries].map((e, i) => i < queries.length - 1 ? [e, 'AND'] : [e]).reduce((a, b) => a.concat(b));

  // Stringify the array, leaving spaces between
  let queryString = 'SELECT * FROM TEST_RESULT WHERE ';
  for (const query of queries) {
    queryString += `${query} `;
  }

  queryString += 'ORDER BY test_date DESC LIMIT 200;';
  return mysql.format(queryString, parameterArray);
};
