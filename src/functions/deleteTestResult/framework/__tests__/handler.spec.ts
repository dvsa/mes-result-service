import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as deleteTestResultSvc from '../../application/delete-test-result-service';
import { HttpStatus } from '../../../../common/application/api/HttpStatus';

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

  it('should resolve and complete with 200 when no error thrown from deleteTestResult', async () => {
    moqDeleteTestResultSvc.setup(x => x()).returns(() => Promise.resolve());
    const res = await handler(dummyApigwEvent);
    expect(res.statusCode).toBe(HttpStatus.OK);
  });

  it('should resolve as internal server error when running through catch', async () => {
    moqDeleteTestResultSvc.setup(x => x()).throws(new Error('err'));

    const res = await handler(dummyApigwEvent);

    expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
