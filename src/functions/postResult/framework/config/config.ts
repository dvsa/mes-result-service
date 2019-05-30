import {
  defaultIfNotPresent,
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from '../../../../common/framework/config/config-helpers';

export type Config = {
  mesDatabaseHostname: string;
  mesDatabaseName: string;
  mesDatabaseUsername: string;
  mesDatabasePassword: string;
};

let configuration: Config;
export const bootstrapConfig = async (): Promise<void> => {
  configuration = {
    mesDatabaseHostname: throwIfNotPresent(
      process.env.MES_DB_HOST_NAME,
      'mesDatabaseHostname',
    ),
    mesDatabaseName: throwIfNotPresent(
      process.env.MES_DB_NAME,
      'tarsReplicaDatabaseName',
    ),
    mesDatabaseUsername: throwIfNotPresent(
      process.env.MES_DB_USERNAME,
      'tarsReplicaDatabaseUsername',
    ),
    mesDatabasePassword: await tryFetchRdsAccessToken(
      process.env.MES_DB_ENDPOINT || '',
      process.env.MES_DB_USERNAME || '',
      'SECRET_DB_PASSWORD_KEY',
    ),
  };
  console.log(`config is ${JSON.stringify(configuration)}`);
};

export const config = (): Config => configuration;
