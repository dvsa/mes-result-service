import {generateSignerOptions, tryFetchRdsAccessToken} from '../config-helpers';

describe('ConfigHelpers', () => {
  beforeEach(() => {
    process.env.fallback = undefined;
    process.env.AWS_REGION = 'region';
  });

  describe('generateSignerOptions', () => {
    it('should return a signer options object', () => {
      const opts = generateSignerOptions('hostname', 'username');
      expect(opts).toEqual({
        username: 'username',
        hostname: 'hostname',
        port: 3306,
        region: 'region',
      });
    });
  });

  describe('tryFetchRdsAccessToken', () => {
    it('should return the fallback when defined and no hostname or username', async () => {
      process.env.fallback = 'some-fallback';
      const token = await tryFetchRdsAccessToken('', 'username', 'fallback');
      expect(token).toEqual('some-fallback');
    });
    it('should throw when the fallback is not defined and missing host and username', async () => {
      try {
        await tryFetchRdsAccessToken('', 'username', 'hello');
      } catch (err) {
        expect(err).toEqual(new Error('No value for fallback envvar hello for config'));
      }
    });
    it('should be defined', async () => {
      const token = await tryFetchRdsAccessToken('hostname', 'username', 'hello');
      expect(token).toBeDefined();
    });
  });
});
