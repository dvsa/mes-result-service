import {
  throwIfNotPresent,
  tryFetchRdsAccessToken,
} from './config-helpers';

export type Config = {
  mesDatabaseHostname: string;
  mesDatabaseName: string;
  mesDatabaseUsername: string;
  mesDatabasePassword: string;
};

let configuration: Config;
export const bootstrapConfig = async (): Promise<void> => {
  configuration = {
    mesDatabaseHostname: 'training-db-1.cs4v7hzcozof.eu-west-1.rds.amazonaws.com',
    mesDatabaseName: 'training',
    mesDatabaseUsername: 'admin',
    mesDatabasePassword: 'pOEPrKE2X3qJImnoKySP',
  };
};

export const config = (): Config => configuration;
