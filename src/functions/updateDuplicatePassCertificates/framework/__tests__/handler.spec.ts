import { APIGatewayEvent, Context } from 'aws-lambda';
import { Mock, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import { sampleToken_12345678 } from '../../../../common/framework/config/sampleTokens';
import { handler } from '../handler';
import * as updateDuplicateCertificatesService from '../repository/duplicate-certificate-service';

const lambdaTestUtils = require('aws-lambda-test-utils');

describe('post-spoiled-pass-certificates handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqUpdateDuplicateCertificate = Mock.ofInstance(updateDuplicateCertificatesService.updateDuplicateCertificates);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqUpdateDuplicateCertificate.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent(
      {
        headers: {
          Authorization: sampleToken_12345678,
        },
      });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(updateDuplicateCertificatesService, 'updateDuplicateCertificates')
      .and.callFake(moqUpdateDuplicateCertificate.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of valid repository reference', () => {
    it('should return Created response if valid query parameters are supplied',
       async () => {

         const response = await handler(dummyApigwEvent, dummyContext);

         expect(response.statusCode).toEqual(201);
       });
  });
});
