import { ScheduledEvent } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as database from '../../../../common/framework/mysql/database';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';

describe('retryProcessing handler', () => {
  let dummyScheduledEvent: ScheduledEvent;

  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqGetConnection = Mock.ofInstance(database.getConnection);

  beforeEach(() => {
    moqBootstrapConfig.reset();

    dummyScheduledEvent = lambdaTestUtils.mockEventCreator;

    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
    spyOn(database, 'getConnection').and.callFake(moqGetConnection.object);
  });

  it('should always bootstrap the config', async () => {
    await handler(dummyScheduledEvent);
    moqBootstrapConfig.verify(x => x(), Times.once());
  });

  it('should call the getConnection function', async () => {
    await handler(dummyScheduledEvent);
    expect(database.getConnection).toHaveBeenCalled();
  });

  it('should throw a 500 error if retry fails', async () => {
    const resp = await handler(dummyScheduledEvent);
    expect(resp.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
