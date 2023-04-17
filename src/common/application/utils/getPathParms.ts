import { APIGatewayEvent } from 'aws-lambda';

export const getAppRefFromPathParameters = (
  event: APIGatewayEvent,
) => event?.pathParameters['appRef'] || event?.pathParameters['app-ref'];

export const getStaffNumberFromPathParameters = (
  event: APIGatewayEvent,
) => event?.pathParameters['staffNumber'] || event?.pathParameters['staff-number'];
