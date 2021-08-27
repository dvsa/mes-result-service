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

  it('should send NOT_FOUND when delete testRecord service throws NoDeleteWarning', async () => {
    moqDeleteTestResultSvc.setup(x => x()).throws(new NoDeleteWarning());

    const res = await handler(dummyApigwEvent, dummyContext);

    expect(res.statusCode).toBe(404);
  });
});
