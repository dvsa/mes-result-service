import { APIGatewayEventRequestContext } from 'aws-lambda';
import {error} from '@dvsa/mes-microservice-common/application/utils/logger';

export const getEmployeeIdFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.staffNumber === 'string') {
    return requestContext.authorizer.staffNumber;
  }
  error('No staff number found in request context');
  return null;
};
