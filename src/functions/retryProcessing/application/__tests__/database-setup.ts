import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';

export let db: mysql.Connection = null;
export let retryProcessor: RetryProcessor = null;

export const dbSetup = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
    });
    retryProcessor = new RetryProcessor(db);
    resolve();
  });
};
