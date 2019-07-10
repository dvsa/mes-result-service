import * as mysql from 'mysql2';
/**
 * Builds query to retrieve test results where TARS, RSIS and NOTIFY uploads
 * have been accepted
 *
 */
export const buildSuccessfullyProcessedQuery = () => {
  const template = `
    SELECT t.application_reference, t.staff_number
    FROM TEST_RESULT t
    WHERE t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
    AND EXISTS (SELECT 'x'
              FROM UPLOAD_QUEUE u
              WHERE u.application_reference = t.application_reference
              AND u.staff_number = t.staff_number
              AND u.interface =  (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS')
              AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
              )
    AND EXISTS (SELECT 'x'
              FROM UPLOAD_QUEUE u
              WHERE u.application_reference = t.application_reference
              AND u.staff_number = t.staff_number
              AND u.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS')
              AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
              )
    AND EXISTS (SELECT 'x'
              FROM UPLOAD_QUEUE u
              WHERE u.application_reference = t.application_reference
              AND u.staff_number = t.staff_number
              AND u.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY')
              AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
              );`;

  return mysql.format(template);
};

/**
 * Builds query to retrieve errors to retry. Will be run once per interace type (TARS, RSIS and NOTIFY)
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildErrorsToRetryQuery = (rsisRetryCount: number,
                                        notifyRetryCount: number,
                                        tarsRetryCount: number) => {
  const template = `
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count < ?
    AND exists ( SELECT 'x'
                  FROM TEST_RESULT t
                  WHERE t.application_reference = u.application_reference
                  AND t.staff_number = u.staff_number
                  AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                  )
    UNION
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count < ?
    AND exists ( SELECT 'x'
                FROM TEST_RESULT t
                WHERE t.application_reference = u.application_reference
                AND t.staff_number = u.staff_number
                AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                )
    UNION
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count < ?
    AND exists ( SELECT 'x'
                  FROM TEST_RESULT t
                  WHERE t.application_reference = u.application_reference
                  AND t.staff_number = u.staff_number
                  AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                  );`;

  return mysql.format(template, [rsisRetryCount, notifyRetryCount, tarsRetryCount]);
};

/**
 * Builds query to retrieve errors to abort. Will be run once per interace typee (TARS, RSIS and NOTIFY)
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildErrorsToAbortQuery = (rsisRetryCount: number,
                                        notifyRetryCount: number,
                                        tarsRetryCount: number) => {
  const template = `
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count >= ?
    AND exists ( SELECT 'x'
                FROM TEST_RESULT t
                WHERE t.application_reference = u.application_reference
                AND t.staff_number = u.staff_number
                AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                )
    UNION
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count >= ?
    AND exists ( SELECT 'x'
                FROM TEST_RESULT t
                WHERE t.application_reference = u.application_reference
                AND t.staff_number = u.staff_number
                AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                )
    UNION
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.interface = (SELECT ID FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS')
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND u.retry_count >= ?
    AND exists ( SELECT 'x'
                FROM TEST_RESULT t
                WHERE t.application_reference = u.application_reference
                AND t.staff_number = u.staff_number
                AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
                );`;

  return mysql.format(template, [rsisRetryCount, notifyRetryCount, tarsRetryCount]);
};

/**
 * Builds query to retrieve support intervention results
 *
 * @param batchSize: number
 */
export const buildSupportInterventionQuery = () => {
  const template = `
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.upload_status  = ( SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND exists ( SELECT 'x'
    FROM TEST_RESULT t
    WHERE t.application_reference = u.application_reference
    AND t.staff_number = u.staff_number
    AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
    );`;
  return mysql.format(template);
};

export const buildQueueRowsToDeleteQuery = (cutOffPointInDays: number) => {
  const template = `
    SELECT application_reference, staff_number, interface
    FROM UPLOAD_QUEUE u
    WHERE u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
    AND u.timestamp < CURDATE() - INTERVAL ? DAY;`;
  return mysql.format(template, [cutOffPointInDays]);
};

/**
 * Generic routine to Delete UPLOAD QUEUE rows
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
*/
export const buildDeleteQueueRowsQuery = (applicationReference: number,
                                          staffNumber: number,
                                          interfaceType: number) => {
  const template = `
    DELETE FROM UPLOAD_QUEUE u
    WHERE u.application_reference = ?
    AND   u.staff_number = ?
    AND   u.interface = ?;`;
  return mysql.format(template, [applicationReference, staffNumber, interfaceType]);
};
/**
 * Generic routine to update UPLOAD QUEUE upload status and retry count
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
 * @param uploadStatusNameFrom
 * @param uploadStatusNameTo
 */

export const buildUpdateQueueLoadStatusAndRetryCountQuery = (applicationReference: number,
                                                             staffNumber: number,
                                                             interfaceType: number,
                                                             uploadStatusNameFrom: string,
                                                             uploadStatusNameTo: string,
                                                             retryCount: number) => {
  const template = `
    UPDATE UPLOAD_QUEUE u
    SET u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?),
        u.retry_count = ?
    WHERE u.application_reference = ?
    AND u.staff_number = ?
    AND u.interface = ?
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?);`;

  return mysql.format(template, [uploadStatusNameTo,
    retryCount,
    applicationReference,
    staffNumber,
    interfaceType,
    uploadStatusNameFrom]);
};

/**
 * Generic routine to update UPLOAD QUEUE upload status
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
 * @param uploadStatusNameFrom
 * @param uploadStatusNameTo
 */

export const buildUpdateQueueLoadStatusQuery = (applicationReference: number,
                                                staffNumber: number,
                                                interfaceType: number,
                                                uploadStatusNameFrom: string,
                                                uploadStatusNameTo: string,
  ) => {
  const template = `
    UPDATE UPLOAD_QUEUE u
    SET u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?)
    WHERE u.application_reference = ?
    AND u.staff_number = ?
    AND u.interface = ?
    AND u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?);`;

  return mysql.format(template,
                      [uploadStatusNameTo, applicationReference, staffNumber, interfaceType, uploadStatusNameFrom]);
};

/**
 * Generic routine to update TEST RESULT result status
 * @param applicationReference
 * @param staffNumber
 * @param resultStatusNameFrom
 * @param resultStatusNameTo
 */
export const buildUpdateTestResultStatusQuery = (applicationReference: number,
                                                 staffNumber: number,
                                                 resultStatusNameFrom: string,
                                                 resultStatusNameTo: string) => {
  const template = `
    UPDATE TEST_RESULT t
    SET t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = ?)
    WHERE t.application_reference = ?
    AND t.staff_number = ?
    AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = ?);`;

  return mysql.format(template, [resultStatusNameTo, applicationReference, staffNumber, resultStatusNameFrom]);
};
