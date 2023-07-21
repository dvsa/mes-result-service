import { APIGatewayEvent, Context } from 'aws-lambda';
import { Mock, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import { sampleToken_12345678 } from '../../../../common/framework/config/sampleTokens';
import * as postSpoiledCertificatesService from '../repository/spoiled-certificate-service';
import { handler } from '../handler';

const lambdaTestUtils = require('aws-lambda-test-utils');

describe('post-spoiled-pass-certificates handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqPostSpoiledCertificates = Mock.ofInstance(postSpoiledCertificatesService.postSpoiledCertificates);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqPostSpoiledCertificates.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent(
      {
        headers: {
          Authorization: sampleToken_12345678,
        },
      });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(postSpoiledCertificatesService, 'postSpoiledCertificates').and.callFake(moqPostSpoiledCertificates.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of invalid repository reference', () => {
    it('should return BadRequest response if no query parameters are supplied', async () => {
      dummyApigwEvent.queryStringParameters = null;

      const response = await handler(dummyApigwEvent, dummyContext);

      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.body)).toEqual('Query parameters have to be supplied');
    });

    it('should return BadRequest response if invalid date format is supplied', async () => {
      dummyApigwEvent.queryStringParameters = {
        spoiledDate: '2023-13-32', // Invalid date
      };

      const response = await handler(dummyApigwEvent, dummyContext);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toContain('Please provide a valid date with the format \'YYYY-MM-DD\'');
    });

  });

  describe('handling of valid repository reference', () => {
    it('should return Created response if valid query parameters are supplied', async () => {
      dummyApigwEvent.queryStringParameters = {
        passCertificateNumber: 'c123x',
        staffNumber: '123',
        spoiledDate: '2023-07-18',
        dtcCode: '01',
        status: '01',
        reason: 'fire',
      };

      const response = await handler(dummyApigwEvent, dummyContext);

      expect(response.statusCode).toEqual(201);
      expect(JSON.parse(response.body)).toEqual('Record Inserted');
    });
  });
});
