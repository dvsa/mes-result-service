import { APIGatewayEvent, Context } from 'aws-lambda';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';

import * as getMissingSertificatesSvc from '../repository/missing-certificate-repository';
import { sampleToken_12345678 } from '../../../../common/framework/config/sampleTokens';
import { handler } from '../handler';
import {
  identifiedMissingCertificates,
  missingCertificates,
  noIdentifiedMissingCertificates,
} from './handler.spec.data';

describe('getPassCertificates/missingCertificates', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqGetMissingCertificates = Mock.ofInstance(getMissingSertificatesSvc.identifyCertificates);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqGetMissingCertificates.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent(
      {
        headers: {
          Authorization: sampleToken_12345678,
        },
      });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(getMissingSertificatesSvc, 'identifyCertificates').and.callFake(moqGetMissingCertificates.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handler', () => {
    it('should handle errors and return an error response', async () => {
      // Simulate an error condition
      const errorCondition = true;

      if (errorCondition) {
        // Throw an error within the try block
        const expectedError = new Error('Simulated error');
        const result = await handler(dummyApigwEvent, dummyContext);

        expect(result.statusCode).toEqual(500); // Check that the status code is 500
      }
    });

    it('should create a response ' +
         'no records found and an appropriate status code when no certs are missing', async () => {
      moqGetMissingCertificates.setup(x => x()).returns(() => Promise.resolve(noIdentifiedMissingCertificates));
      const response = await handler(dummyApigwEvent, dummyContext);
      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual('{"message":"No records found"}');
    });

    it('should create a response ' +
         'finding missing certificates and an appropriate status code', async () => {
      moqGetMissingCertificates.setup(x => x()).returns(() => Promise.resolve(identifiedMissingCertificates));
      const response = await handler(dummyApigwEvent, dummyContext);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify(missingCertificates));
    });
  });
});
