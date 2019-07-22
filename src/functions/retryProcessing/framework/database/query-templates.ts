
export const successfullyProcessedQuery = `
  SELECT DISTINCT
    uq.application_reference,
    uq.staff_number
  FROM UPLOAD_QUEUE uq
  JOIN TEST_RESULT tr
    ON uq.application_reference = tr.application_reference
    AND uq.staff_number = tr.staff_number
    AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
  WHERE
    (uq.application_reference, uq.staff_number) NOT IN (
      SELECT application_reference, staff_number
      FROM UPLOAD_QUEUE
      WHERE upload_status != (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
    )
`;

export const updateErrorsToRetryQueryTemplate = `
  UPDATE UPLOAD_QUEUE uq1
  JOIN (
    SELECT uq.application_reference, uq.staff_number, uq.interface
      FROM UPLOAD_QUEUE uq
      JOIN TEST_RESULT tr
        ON uq.application_reference = tr.application_reference
        AND uq.staff_number = tr.staff_number
        AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
      WHERE
        uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
        AND (
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS') AND uq.retry_count < ?)
          OR
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY') AND uq.retry_count < ?)
          OR
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS') AND uq.retry_count < ?)
        )
  ) uq2
    ON uq1.application_reference = uq2.application_reference
    AND uq1.staff_number = uq2.staff_number
    AND uq1.interface = uq2.interface
  SET uq1.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING');
`;

export const updateErrorsToAbortQueryTemplate = `
  UPDATE TEST_RESULT tr
  JOIN (
    SELECT DISTINCT uq.application_reference, uq.staff_number
    FROM UPLOAD_QUEUE uq
    JOIN TEST_RESULT tr
      ON uq.application_reference = tr.application_reference
      AND uq.staff_number = tr.staff_number
      AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
    WHERE
      uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
      AND (
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS') AND uq.retry_count >= ?)
        OR
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY') AND uq.retry_count >= ?)
        OR
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS') AND uq.retry_count >= ?)
      )
  ) abort
    ON tr.application_reference = abort.application_reference
    AND tr.staff_number = abort.staff_number
  SET tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'ERROR');
`;

export const supportInterventionQuery = `
  SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE
      u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
      AND exists (
        SELECT 'x'
        FROM TEST_RESULT t
        WHERE t.application_reference = u.application_reference
        AND t.staff_number = u.staff_number
        AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
      )
`;

export const deleteAccepetedUploadsQuery = `
  DELETE UPLOAD_QUEUE FROM UPLOAD_QUEUE
  JOIN (
    SELECT application_reference, staff_number, interface
    FROM UPLOAD_QUEUE
    WHERE upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
    AND timestamp < ?
  ) to_delete
    ON UPLOAD_QUEUE.application_reference = to_delete.application_reference
    AND UPLOAD_QUEUE.staff_number = to_delete.staff_number
    AND UPLOAD_QUEUE.interface = to_delete.interface;
`;

export const getDeleteQueueRowsQuery = () => `
    DELETE FROM UPLOAD_QUEUE
    WHERE application_reference = ?
    AND   staff_number = ?
    AND   interface = ?;`;

export const getUpdateQueueLoadStatusAndRetryCountQuery = () => `
    UPDATE UPLOAD_QUEUE
    SET upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?),
        retry_count = ?
    WHERE application_reference = ?
    AND staff_number = ?
    AND interface = ?
    AND upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?);`;

export const getUpdateQueueLoadStatusQuery = () => `
    UPDATE UPLOAD_QUEUE
    SET upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?)
    WHERE application_reference = ?
    AND staff_number = ?
    AND interface = ?
    AND upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?);`;

export const getUpdateTestResultStatusQuery = () => `
    UPDATE TEST_RESULT
    SET result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = ?)
    WHERE application_reference = ?
    AND staff_number = ?;`;
