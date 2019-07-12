
export const getSuccessfullyProcessedQuery = () => `
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

export const getErrorsToRetryQuery = () =>  `
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

export const getErrorsToAbortQuery = () => `
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

export const getSupportInterventionQuery = () => `
    SELECT u.application_reference, u.staff_number, u.interface
    FROM UPLOAD_QUEUE u
    WHERE u.upload_status  = ( SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND exists ( SELECT 'x'
    FROM TEST_RESULT t
    WHERE t.application_reference = u.application_reference
    AND t.staff_number = u.staff_number
    AND t.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
    );`;

export const getQueueRowsToDeleteQuery = () => `
    SELECT application_reference, staff_number, interface
    FROM UPLOAD_QUEUE u
    WHERE u.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
    AND u.timestamp < ?;`;

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
