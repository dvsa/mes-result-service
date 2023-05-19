import { APIGatewayProxyEvent } from 'aws-lambda';
import { getEmployeeIdFromRequestContext } from '../../../common/application/utils/getEmployeeId';

export const verifyRequest = (request: APIGatewayProxyEvent, staffId: string): boolean => {
  const employeeId = getEmployeeIdFromRequestContext(request.requestContext);
  if (employeeId === null) {
    return false;
  }
  return employeeId === staffId;
};
