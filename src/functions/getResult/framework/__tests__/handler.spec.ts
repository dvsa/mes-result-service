import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import {
  sampleToken_12345678,
  testResult,
  applicationReference,
  staffNumber,
  noTestResults,
  moreThanOneTestResult,
} from './handler.spec.data';
import * as getResultSvc from '../repositories/get-result-repository';
import { gunzipSync } from 'zlib';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

describe('getResult handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  const moqGetResult = Mock.ofInstance(getResultSvc.getResult);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqGetResult.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });

    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(getResultSvc, 'getResult').and.callFake(moqGetResult.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of invalid application reference', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['app-ref'] = '@invalidCharacter';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
    });
  });

  describe('handling of invalid staffNumber reference', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['staff-number'] = 'invalidStaffNumber';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
    });
  });

  describe('handling of invalid staffNumber reference', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['staff-number'] = '1234567890123';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
    });
  });

  describe('no test results found', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['app-ref'] = applicationReference.toString();
      dummyApigwEvent.pathParameters['staff-number'] = staffNumber;
      moqGetResult.setup(x => x(It.isAny())).returns(() => Promise.resolve(noTestResults));
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toEqual('No records found matching criteria');
      moqGetResult.verify(x => x(It.isValue(applicationReference)), Times.once());
    });
  });

  // This scenarion should never really happen, since each applicationReference is unique
  // This is put in place as the service is supposed to return only one record at a time
  describe('more than one test result found', () => {
    it('should fail with bad request', async () => {
      dummyApigwEvent.pathParameters['app-ref'] = applicationReference.toString();
      dummyApigwEvent.pathParameters['staff-number'] = staffNumber;
      moqGetResult.setup(x => x(It.isAny())).returns(() => Promise.resolve(moreThanOneTestResult));
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toEqual('More than one record found, internal error');
      moqGetResult.verify(x => x(It.isValue(applicationReference)), Times.once());
    });
  });

  describe('correct applicationReference and staffNumber', () => {
    it('should return a compressed test result matching the URL parameters', async () => {
      dummyApigwEvent.pathParameters['app-ref'] = applicationReference.toString();
      dummyApigwEvent.pathParameters['staff-number'] = staffNumber;
      moqGetResult.setup(x => x(It.isAny())).returns(() => Promise.resolve(testResult));
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      // Check that the compressed data matches the original test_result from the DB

      const decompressedData = gunzipSync(Buffer.from(resp.body, 'base64'));
      const categoryBTest: TestResultSchemasUnion = JSON
        .parse(decompressedData.toString()) as TestResultSchemasUnion;
      expect(categoryBTest).toEqual(testResult[0].test_result);
      moqGetResult.verify(x => x(It.isValue(applicationReference)), Times.once());
    });
  });
});
