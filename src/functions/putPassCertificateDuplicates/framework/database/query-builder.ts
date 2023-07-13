import * as mysql from 'mysql2';

export const duplicateQuery = (): string => {
  const template =
    `INSERT INTO DUPLICATE_CERTIFICATES (pass_certificate_number, times_cert_used, test_details)
         (SELECT pass_certificate_number
               , COUNT(*) as times_cert_used
               , CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT(
                   'application_reference', application_reference
                 , 'staff_number', staff_number
                 , 'test_date', test_date)
                 ), ']')   as test_details
          FROM TEST_RESULT tr
          WHERE tr.pass_certificate_number IS NOT NULL
          GROUP BY pass_certificate_number
          HAVING times_cert_used > 1) # Identify duplicate certificates
     ON DUPLICATE KEY UPDATE times_cert_used=VALUES(times_cert_used),
                             test_details=VALUES(test_details)`;
  const args = [];

  return mysql.format(template, args);
};
