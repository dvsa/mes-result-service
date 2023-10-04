import {QueryParameters} from '../domain/query_parameters';
import {APIGatewayProxyEventQueryStringParameters} from 'aws-lambda/trigger/api-gateway-proxy';

export class SearchResultsParams {
  private queryParameters: QueryParameters = new QueryParameters();

  constructor(queryStringParams: APIGatewayProxyEventQueryStringParameters) {
    this.construct(queryStringParams);
  }

  private construct(queryStringParams: APIGatewayProxyEventQueryStringParameters) {
    const queryParameters: QueryParameters = new QueryParameters();

    // Set the parameters from the event to the queryParameter holder object
    if (queryStringParams.startDate) {
      queryParameters.startDate = queryStringParams.startDate;
    }

    if (queryStringParams.endDate) {
      queryParameters.endDate = queryStringParams.endDate;
    }

    if (queryStringParams.driverNumber) {
      queryParameters.driverNumber = queryStringParams.driverNumber;
    }

    if (queryStringParams.staffNumber) {
      queryParameters.staffNumber = queryStringParams.staffNumber;
    }

    // guard against filtering on rekey without providing a staff number
    if (queryStringParams.rekey) {
      queryParameters.rekey = !!(queryStringParams.rekey === 'true' && queryParameters.staffNumber);
    }

    if (queryStringParams.dtcCode) {
      queryParameters.dtcCode = queryStringParams.dtcCode;
    }

    if (queryStringParams.applicationReference) {
      queryParameters.applicationReference = queryStringParams.applicationReference;
    }

    if (queryStringParams.excludeAutoSavedTests) {
      queryParameters.excludeAutoSavedTests = queryStringParams.excludeAutoSavedTests === 'true' ?
        'true' : 'false';
    }
    if (queryStringParams.activityCode) {
      queryParameters.activityCode = queryStringParams.activityCode;
    }

    if (queryStringParams.category) {
      queryParameters.category = decodeURIComponent(queryStringParams.category);
    }

    if (queryStringParams.passCertificateNumber) {
      queryParameters.passCertificateNumber = decodeURIComponent(queryStringParams.passCertificateNumber);
    }

    this.queryParameters = queryParameters;
  }

  public get() {
    return this.queryParameters;
  }
}
