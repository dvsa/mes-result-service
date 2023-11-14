import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getStaffNumberFromRequestContext } from '@dvsa/mes-microservice-common/framework/security/authorisation';
import { APIGatewayProxyEvent } from 'aws-lambda';

export const verifyRequest = (request: APIGatewayProxyEvent, staffId: string): boolean => {
  const employeeId = getStaffNumberFromRequestContext(request.requestContext);
  if (employeeId === null) {
    warn('No employee ID found in request context');
    return false;
  }
  return employeeId === staffId;
};
