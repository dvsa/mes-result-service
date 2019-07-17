import sqlite3 from 'sqlite3';

export const run = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

export const get = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
};

export const all = (db: sqlite3.Database, sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};
