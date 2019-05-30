import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { config } from '../framework/config/config';
import { query } from '../../../common/framework/mysql/database';

export const saveTestResult = async (testResult: StandardCarTestCATBSchema): Promise<void> => {
  const configuration = config();
  const connection = mysql.createConnection({
    host: configuration.mesDatabaseHostname,
    database: configuration.mesDatabaseName,
    user: configuration.mesDatabaseUsername,
    password: configuration.mesDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : 'Amazon RDS',
    authSwitchHandler(data: any, cb: any) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.mesDatabasePassword}\0`));
      }
    },
  });

  console.log('running insert...');
  await query(connection, 'INSERT INTO TSTTBL VALUES(\'a\', \'b\')');
  console.log('completed insert!');
  return Promise.resolve();
};
