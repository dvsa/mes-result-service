import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as deleteTestResultSvc from '../../application/delete-testResult-service';
import { NoDeleteWarning } from '../../domain/NoDeleteWarning';

describe('deleteTestResult handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;

  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqDeleteTestResultSvc = Mock.ofInstance(deleteTestResultSvc.deleteTestResult);

  beforeEach(() => {
    moqDeleteTestResultSvc.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({});
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
    spyOn(deleteTestResultSvc, 'deleteTestResult').and.callFake(moqDeleteTestResultSvc.object);
  });

  it('should respond with a CREATED response if provided a valid body', async () => {
    moqDeleteTestResultSvc.setup(x => x(It.isAny())).returns(() => Promise.resolve());

    dummyApigwEvent.body = JSON.stringify({
      retry_count: 12,
      error_message: null,
    });

    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(201);
  });

  it('should send a BAD_REQUEST response if the request body is blank', async () => {
    dummyApigwEvent.body = '';

    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message).toBe('Empty request body');
  });

  it('should send a BAD_REQUEST response when the body isnt in JSON', async () => {
    dummyApigwEvent.body = 'this is not json 1234';

    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message).toBe('Error parsing request body into JSON');
  });

  it('should send NOT_FOUND when delete testRecord service throws NoDeleteWarning', async () => {
    moqDeleteTestResultSvc.setup(x => x(It.isAny())).throws(new NoDeleteWarning());
    dummyApigwEvent.body = JSON.stringify({
      retry_count: 12,
      error_message: null,
    });

    const res = await handler(dummyApigwEvent, dummyContext);

    expect(res.statusCode).toBe(404);
  });
});
