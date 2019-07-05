import Response from '../api/Response';

export default (
  body: {},
  statusCode = 200,
  reqHeaders: { [id: string]: string } = {},
  stringifyBody: boolean = true,
): Response => {
  let responseBody: {};
  const accessControlAllowOriginHeader = {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  };

  if (body !== null) {
    responseBody = stringifyBody ? JSON.stringify(body) : body;
  }

  return {
    statusCode,
    headers: { ...accessControlAllowOriginHeader, ...reqHeaders },
    body: responseBody,
  };
};
