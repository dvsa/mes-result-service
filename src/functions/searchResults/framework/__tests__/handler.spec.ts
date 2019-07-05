import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import { queryParameter, sampleToken_12345678, testResult, testResultResponse } from '../__tests__/handler.spec.data';
import * as searchResultsSvc from '../repositories/search-repository';

describe('searchResults handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqSearchResults = Mock.ofInstance(searchResultsSvc.getConciseSearchResults);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqSearchResults.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(searchResultsSvc, 'getConciseSearchResults').and.callFake(moqSearchResults.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of no parameters', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters = null;
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(resp.body).toBe('Query parameters have to be supplied');
    });
  });

  describe('handling of only isLDTM parameter', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters['isLDTM'] = 'true';
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(resp.body).toBe('Query parameters have to be supplied');
    });
  });

  describe('using invalid query parameters', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters['whatever'] = 'randomvalue';
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(resp.body).toBe('Query parameters have to be supplied');
    });
  });

  describe('using valid query parameters as LDTM', () => {
    it('gets the relevant results', async () => {
      dummyApigwEvent.queryStringParameters['isLDTM'] = 'true';
      dummyApigwEvent.queryStringParameters['startDate'] = queryParameter.startDate;
      dummyApigwEvent.queryStringParameters['endDate'] = queryParameter.endDate;
      dummyApigwEvent.queryStringParameters['driverNumber'] = queryParameter.driverNumber;
      dummyApigwEvent.queryStringParameters['dtcCode'] = queryParameter.dtcCode;
      dummyApigwEvent.queryStringParameters['staffNumber'] = queryParameter.staffNumber;
      dummyApigwEvent.queryStringParameters['applicationReference'] = queryParameter.applicationReference;
      moqSearchResults.setup(x => x(It.isAny())).returns(() => Promise.resolve(testResult));
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual(testResultResponse);
      moqSearchResults.verify(x => x(It.isObjectWith(queryParameter)), Times.once());
    });
  });
});
