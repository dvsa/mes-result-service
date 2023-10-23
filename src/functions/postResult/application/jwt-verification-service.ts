import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getEmployeeIdFromRequestContext } from '../../../common/application/utils/getEmployeeId';

export const verifyRequest = (request: APIGatewayProxyEvent, staffId: string): boolean => {
  const employeeId = getEmployeeIdFromRequestContext(request.requestContext);
  if (employeeId === null) {
    warn('No employee ID found in request context');
    return false;
  }
  return employeeId === staffId;
};
