import * as mysql from 'mysql2';
import { config } from '../config/config';
import { certificate } from '../../certs/ssl_profiles';

export const getConnection = (): mysql.Connection => {
  const configuration = config();

  return mysql.createConnection({
    host: configuration.mesDatabaseHostname,
    database: configuration.mesDatabaseName,
    user: configuration.mesDatabaseUsername,
    password: configuration.mesDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certificate,
    authSwitchHandler(data: any, cb: any) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.mesDatabasePassword}\0`));
      }
    },
  });
};
