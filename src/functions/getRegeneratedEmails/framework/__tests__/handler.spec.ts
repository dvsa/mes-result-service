import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import {
  sampleToken,
  applicationReference,
  noResults,
  normalResultSinglar,
} from '../__tests__/handler.spec.data';
import * as getRegeneratedEmailService from '../repositories/get-regenerated-emails-repository';
import { gunzipSync } from 'zlib';
import { RegeneratedEmailsRecord } from '../../../../common/domain/regenerated-emails';

fdescribe('getRegeneratedEmails handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqGetRegeneratedEmails = Mock.ofInstance(getRegeneratedEmailService.getRegeneratedEmails);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqGetRegeneratedEmails.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken,
      },
    });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(getRegeneratedEmailService, 'getRegeneratedEmails').and.callFake(moqGetRegeneratedEmails.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of invalid application reference', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['appRef'] = '@invalidCharacter';
      const response = await handler(dummyApigwEvent, dummyContext);
      expect(response.statusCode).toBe(400);
    });
  });


  describe('handling of invalid application reference', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['appRef'] = '1000000000001';
      const response = await handler(dummyApigwEvent, dummyContext);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('no test results found', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['appRef'] = applicationReference.toString();
      moqGetRegeneratedEmails.setup(x => x(It.isAny())).returns(() => noResults as any);
      const response = await handler(dummyApigwEvent, dummyContext);
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual('No records found matching criteria');
      moqGetRegeneratedEmails.verify(x => x(It.isValue(applicationReference)), Times.once());
    });
  });

  describe('valid applicationReference returns payload', () => {
    it('should return a compressed test result matching the URL parameters single result', async () => {
      dummyApigwEvent.pathParameters['appRef'] = applicationReference.toString();
      moqGetRegeneratedEmails.setup(x => x(It.isAny())).returns(() => normalResultSinglar as any);
      const response = await handler(dummyApigwEvent, dummyContext);
      const decompressedData = gunzipSync(Buffer.from(response.body, 'base64'));
      const singlarMatch: RegeneratedEmailsRecord = JSON.parse(decompressedData.toString()) as RegeneratedEmailsRecord;

      expect(response.statusCode).toBe(200);
      expect(singlarMatch.appRef).toEqual(applicationReference);
      expect(singlarMatch.emailRegenerationDetails.length).toEqual(1);
      moqGetRegeneratedEmails.verify(x => x(It.isValue(applicationReference)), Times.once());
    });
  });
});
