import * as sqlite3 from 'sqlite3';
import { TestRetryProcessor } from './TestRetryProcessor';

export let db: sqlite3.Database = null;
export let retryProcessor: TestRetryProcessor = null;

export const  initialiseDb = (): void => {
  db.run(`CREATE TABLE RESULT_STATUS (
      id TINYINT PRIMARY KEY,
      result_status_name VARCHAR(10) NOT NULL);`,
         (err: Error) => {
           if (err) {
             throw err;
           }
           db.run(`INSERT INTO RESULT_STATUS (id, result_status_name) VALUES( ?, ?);`, [0, 'ACCEPTED']);
           db.run(`INSERT INTO RESULT_STATUS (id, result_status_name) VALUES( ?, ?);`, [1, 'PROCESSING']);
           db.run(`INSERT INTO RESULT_STATUS (id, result_status_name) VALUES( ?, ?);`, [2, 'PROCESSED']);
           db.run(`INSERT INTO RESULT_STATUS (id, result_status_name) VALUES( ?, ?);`, [3, 'PENDING']);
           db.run(`INSERT INTO RESULT_STATUS (id, result_status_name) VALUES( ?, ?);`, [4, 'ERROR']);

         });

  db.run(`CREATE TABLE PROCESSING_STATUS (
            id TINYINT PRIMARY KEY,
            processing_status_name VARCHAR(10) NOT NULL
          );`,
         (err: Error) => {
           if (err) {
             throw err;
           }
           db.run(`INSERT INTO PROCESSING_STATUS (id, processing_status_name) VALUES( ?, ?);`, [0, 'PROCESSING']);
           db.run(`INSERT INTO PROCESSING_STATUS (id, processing_status_name) VALUES( ?, ?);`, [1, 'ACCEPTED']);
           db.run(`INSERT INTO PROCESSING_STATUS (id, processing_status_name) VALUES( ?, ?);`, [2, 'FAILED']);

         });
  db.run(`CREATE TABLE INTERFACE_TYPE (
            id TINYINT PRIMARY KEY,
            interface_type_name VARCHAR(6)
          );`,
         (err: Error) => {
           if (err) {
             throw err;
           }
           db.run(`INSERT INTO INTERFACE_TYPE (id, interface_type_name) VALUES (?, ?);`, [0, 'TARS']);
           db.run(`INSERT INTO INTERFACE_TYPE (id, interface_type_name) VALUES (?, ?);`, [1, 'RSIS']);
           db.run(`INSERT INTO INTERFACE_TYPE (id, interface_type_name) VALUES (?, ?);`, [2, 'NOTIFY']);
         });

  db.run(`CREATE TABLE TEST_RESULT (
            application_reference BIGINT NOT NULL,
            staff_number VARCHAR(10) NOT NULL,
            test_result JSON NOT NULL,
            test_date DATE NOT NULL,
            tc_id BIGINT NOT NULL,
            tc_cc VARCHAR(6) NOT NULL,
            driver_number VARCHAR(24) NOT NULL,
            driver_surname VARCHAR(50) NOT NULL,
            result_status TINYINT NOT NULL,
            PRIMARY KEY (application_reference, staff_number),
            FOREIGN KEY (result_status) REFERENCES RESULT_STATUS(id)
          );`,
         (err: Error) => {
           if (err) {
             throw err;
           }
           db.run(`INSERT INTO TEST_RESULT ( application_reference, staff_number, test_result, test_date,
              tc_id, tc_cc, driver_number, driver_surname, result_status)
              values (1, '1234', '{}', date('now'),
              1,2, '11111', 'faulds',1);`);

           db.run(`INSERT INTO TEST_RESULT (application_reference,
                                        staff_number,
                                       test_result,
                                        test_date,
                                        tc_id,
                                        tc_cc,
                                        driver_number,
                                        driver_surname,
                                        result_status)
              values(2,'1234','{}',date('now'),
                     1,2,'11111','faulds',1);`);

           db.run(`INSERT INTO TEST_RESULT(application_reference,
                                      staff_number,
                                      test_result,
                                      test_date,
                                      tc_id,
                                      tc_cc,
                                      driver_number,
                                      driver_surname,
                                      result_status
          )
            values(3,
                   '1234',
                   '{}',
                   date('now'),
                   1,
                   2,
                   '11111',
                   'faulds',
                   1);`);
           db.run(`INSERT INTO TEST_RESULT(application_reference,
                                      staff_number,
                                      test_result,
                                      test_date,
                                      tc_id,
                                      tc_cc,
                                      driver_number,
                                      driver_surname,
                                      result_status)
                      values(4,
                              '1234',
                              '{}',
                              date('now'),
                              1,
                              2,
                              '11111',
                              'faulds',
                              3);`);

           db.run(`INSERT INTO TEST_RESULT(application_reference,
                                      staff_number,
                                      test_result,
                                      test_date,
                                      tc_id,
                                      tc_cc,
                                      driver_number,
                                      driver_surname,
                                      result_status)
            values(5,
                   '1234',
                   '{}',
                   date('now','-35 days'),
                   1,
                   2,
                   '11111',
                   'faulds',
                   0);`);
           db.run(`CREATE INDEX staff_number ON TEST_RESULT(staff_number);`);
           db.run(`CREATE INDEX tc_cc ON TEST_RESULT(tc_cc);`);
           db.run(`CREATE INDEX driver_number ON TEST_RESULT(driver_number);`);
           db.run(`CREATE INDEX test_date ON TEST_RESULT(test_date);`);

         });

  db.run(`CREATE TABLE UPLOAD_QUEUE (
            application_reference BIGINT NOT NULL,
            staff_number VARCHAR(10) NOT NULL,
            timestamp DATETIME NOT NULL,
            interface TINYINT NOT NULL,
            upload_status TINYINT NOT NULL,
            retry_count INT NOT NULL,
            error_message VARCHAR(1000),
            PRIMARY KEY (application_reference, staff_number, interface),
            FOREIGN KEY (interface) REFERENCES INTERFACE_TYPE(id),
            FOREIGN KEY (upload_status) REFERENCES PROCESSING_STATUS(id)
          );`,
         (err: Error) => {
           if (err) {
             throw err;
           }
           db.run(`INSERT INTO UPLOAD_QUEUE (
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values
              (
              1,
              '1234',
              datetime('now'),
              0,
              1,
              0,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              1,
              '1234',
              datetime('now'),
              1,
              1,
              0,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE (
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values
              (
              1,
              '1234',
              datetime('now'),
              2,
              1,
              0,
              '');`);

         // 2.	Errors to retry

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              2,
              '1234',
              datetime('now'),
              0,
              2,
              1,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              2,
              '1234',
              datetime('now'),
              1,
              2,
              0,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              2,
              '1234',
              datetime('now'),
              2,
              2,
              0,
              '');`);

           //  3.	Errors to abort

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              3,
              '1234',
              datetime('now'),
              0,
              2,
              10,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              3,
              '1234',
              datetime('now'),
              1,
              2,
              10,
              '');`);
           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              3,
              '1234',
              datetime('now'),
              2,
              2,
              10,
              '');`);

           // 4.	Support intervention

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              4,
              '1234',
              datetime('now'),
              0,
              2,
              1,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              4,
              '1234',
              datetime('now'),
              1,
              2,
              10,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              4,
              '1234',
              datetime('now'),
              2,
              2,
              10,
              '');`);

           // 5 delete old entries
           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              5,
              '1234',
              date('now', '-35 days'),
              0,
              1,
              1,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              5,
              '1234',
              date('now','-35 days'),
              1,
              1,
              10,
              '');`);

           db.run(`INSERT INTO UPLOAD_QUEUE(
              application_reference,
              staff_number,
              timestamp,
              interface,
              upload_status,
              retry_count,
              error_message) values(
              5,
              '1234',
              date('now','-35 days'),
              2,
              1,
              10,
              '');`);
         });

};

export const dbSetup = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(':memory:',
                              (err: Error) => {
                                if (err) {
                                  reject();
                                }
                                initialiseDb();
                              });

    retryProcessor = new TestRetryProcessor();
    retryProcessor.setDb(db);
    resolve();
  });
};
