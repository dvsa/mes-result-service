import * as sqlite3 from 'sqlite3';
import { TestRetryProcessor } from './TestRetryProcessor';
import { run } from './sqlite-helper';

export let db: sqlite3.Database = null;
export let retryProcessor: TestRetryProcessor = null;

export const initialiseDb = async (): Promise<void> => {
  try {
    const runOnDb = run.bind(null, db);
    await runOnDb(
      `
      CREATE TABLE RESULT_STATUS (
        id TINYINT PRIMARY KEY,
        result_status_name VARCHAR(10) NOT NULL
      )
      `,
    );
    await runOnDb(
      `
      INSERT INTO RESULT_STATUS (id, result_status_name) VALUES
        (0,'ACCEPTED'),
        (1,'PROCESSING'),
        (2,'PROCESSED'),
        (3,'PENDING'),
        (4,'ERROR')
      `,
    );
    await runOnDb(
      `
      CREATE TABLE PROCESSING_STATUS (
        id TINYINT PRIMARY KEY,
        processing_status_name VARCHAR(10) NOT NULL
      )
      `,
    );
    await runOnDb(
      `
      INSERT INTO PROCESSING_STATUS (id,processing_status_name) VALUES
        (0,'PROCESSING'),
        (1,'ACCEPTED'),
        (2,'FAILED')
      `,
    );
    await runOnDb(
      `
      CREATE TABLE INTERFACE_TYPE (
        id TINYINT PRIMARY KEY,
        interface_type_name VARCHAR(6)
      )
    `,
    );
    await runOnDb(
      `
      INSERT INTO INTERFACE_TYPE (id,interface_type_name) VALUES
        (0,'TARS'),
        (1,'RSIS'),
        (2,'NOTIFY')
      `,
    );
    await runOnDb(
      `
      CREATE TABLE TEST_RESULT (
        application_reference BIGINT NOT NULL,
        staff_number VARCHAR(10) NOT NULL,
        test_result JSON NOT NULL,
        test_date DATE NOT NULL,
        tc_id BIGINT NOT NULL,
        tc_cc VARCHAR(6) NOT NULL,
        driver_number VARCHAR(24) NOT NULL,
        driver_surname VARCHAR(50) NOT NULL,
        result_status TINYINT NOT NULL,
        PRIMARY KEY (application_reference,staff_number),
        FOREIGN KEY (result_status) REFERENCES RESULT_STATUS(id)
      )
      `,
    );
    await runOnDb(
      `
      INSERT INTO TEST_RESULT VALUES
        (1,'1234','{}',date('now'),1,2,'11111','Pearson',1),
        (2,'1234','{}',date('now'),1,2,'11111','Pearson',1),
        (3,'1234','{}',date('now'),1,2,'11111','Pearson',1),
        (4,'1234','{}',date('now'),1,2,'11111','Pearson',3),
        (5,'1234','{}',date('now','-35 days'),1,2,'11111','Pearson',0),
        (6,'1234','{}',date('now'),1,2,'11111','Pearson',1)
      `,

    );
    await runOnDb(`CREATE INDEX staff_number ON TEST_RESULT(staff_number)`);
    await runOnDb(`CREATE INDEX tc_cc ON TEST_RESULT(tc_cc)`);
    await runOnDb(`CREATE INDEX driver_number ON TEST_RESULT(driver_number)`);
    await runOnDb(`CREATE INDEX test_date ON TEST_RESULT(test_date)`);

    await runOnDb(
      `
      CREATE TABLE UPLOAD_QUEUE (
        application_reference BIGINT NOT NULL,
        staff_number VARCHAR(10) NOT NULL,
        timestamp DATETIME NOT NULL,
        interface TINYINT NOT NULL,
        upload_status TINYINT NOT NULL,
        retry_count INT NOT NULL,
        error_message VARCHAR(1000),
        PRIMARY KEY (application_reference,staff_number,interface),
        FOREIGN KEY (interface) REFERENCES INTERFACE_TYPE(id),
        FOREIGN KEY (upload_status) REFERENCES PROCESSING_STATUS(id)
      )
      `,
    );

    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (1,'1234',datetime('now'),0,1,0,''),
        (1,'1234',datetime('now'),1,1,0,''),
        (1,'1234',datetime('now'),2,1,0,'')
      `,
    );

    // Missing Notify record, indicates a terminated test
    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (6,'1234',datetime('now'),0,1,0,''),
        (6,'1234',datetime('now'),1,1,0,'')
      `,
    );

    // 2. Errors to retry
    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (2,'1234',datetime('now'),0,2,1,''),
        (2,'1234',datetime('now'),1,2,0,''),
        (2,'1234',datetime('now'),2,2,0,'')
      `,
    );

    //  3. Errors to abort
    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (3,'1234',datetime('now'),0,2,10,''),
        (3,'1234',datetime('now'),1,2,10,''),
        (3,'1234',datetime('now'),2,2,10,'')
      `,
    );

    // 4.	Support intervention
    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (4,'1234',datetime('now'),0,2,1,''),
        (4,'1234',datetime('now'),1,2,10,''),
        (4,'1234',datetime('now'),2,2,10,'')
      `,
    );

    // 5 delete old entries
    await runOnDb(
      `
      INSERT INTO UPLOAD_QUEUE VALUES
        (5,'1234',date('now','-35 days'),0,1,1,''),
        (5,'1234',date('now','-35 days'),1,1,10,''),
        (5,'1234',date('now','-35 days'),2,1,10,'')
      `,
    );
  } catch (err) {
    console.error('Failure setting up test DB', err);
  }
};

export const dbSetup = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(
      ':memory:',
      (err: Error) => {
        if (err) {
          reject(err);
        }
        initialiseDb().then(() => {
          retryProcessor = new TestRetryProcessor();
          retryProcessor.setDb(db);
          resolve();
        }).catch((err) => {
          reject(err);
        });
      },
    );
  });
};
