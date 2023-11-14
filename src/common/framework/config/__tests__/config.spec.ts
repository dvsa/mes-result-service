import {bootstrapConfig, Config, config} from '../config';
import * as helpers from '../config-helpers';

describe('Config', () => {
  beforeEach(() => {
    process.env.MES_DB_HOST_NAME = 'hostname';
    process.env.MES_DB_NAME = 'db-name';
    process.env.MES_DB_USERNAME = 'user-name';
    process.env.MES_DB_PASSWORD = 'pword';
  });

  describe('config', () => {
    it('should return a config object using offline config', async () => {
      process.env.IS_OFFLINE = 'true';

      await bootstrapConfig();

      expect(config()).toEqual({
        mesDatabaseHostname: 'hostname',
        mesDatabaseName: 'db-name',
        mesDatabaseUsername: 'user-name',
        mesDatabasePassword: 'pword',
      } as Config);
    });

    it('should return a config object using access-token', async () => {
      process.env.IS_OFFLINE = 'false';

      spyOn(helpers, 'tryFetchRdsAccessToken').and.returnValue(Promise.resolve('access-token'));

      await bootstrapConfig();

      expect(config()).toEqual({
        mesDatabaseHostname: 'hostname',
        mesDatabaseName: 'db-name',
        mesDatabaseUsername: 'user-name',
        mesDatabasePassword: 'access-token',
      } as Config);
    });
  });
});
