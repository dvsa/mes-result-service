import * as mysql from 'mysql2';

export const getPassCertificates = (): string => {
  const template =
    `SELECT tr.pass_certificate_number AS pass_certificate_number
          , tr.staff_number AS staff_number
          , tr.tc_id AS test_centre_id
          , tr.tc_cc AS test_centre
          , tr.test_date AS test_date
          , CASE
                WHEN substr(tr.pass_certificate_number, 6, 2) = 00 THEN 
                    CONCAT(
                        substr(tr.pass_certificate_number, 1, 1)
                        ,substr(tr.pass_certificate_number, 2, 4)-1
                        ,'51-'
                        ,substr(tr.pass_certificate_number, 1, 5)
                        ,'00'
                        )
                WHEN substr(tr.pass_certificate_number, 6, 2) BETWEEN 01 AND 50 THEN 
                    CONCAT(
                        substr(tr.pass_certificate_number, 1, 5)
                        ,'01-'
                        ,substr(tr.pass_certificate_number, 1, 5)
                        ,'50'
                        )
                ELSE CONCAT(
                    substr(tr.pass_certificate_number, 1, 5)
                    ,'51-'
                    ,substr(tr.pass_certificate_number, 1, 1)
                    ,substr(tr.pass_certificate_number, 2, 4)+1
                    ,'00'
                    )
            END AS book
          , substr(tr.pass_certificate_number, 6, 2) AS cert_number
     FROM TEST_RESULT tr
     WHERE tr.pass_certificate_number IS NOT NULL
     UNION
     SELECT sc.pass_certificate_number AS pass_certificate_number
          , sc.staff_number AS staff_number
          , sc.tc_id AS test_centre_id
          , '' AS test_centre
          , sc.spoiled_date AS test_date
          , CASE
                WHEN substr(sc.pass_certificate_number, 6, 2) = 00 THEN 
                    CONCAT(
                        substr(sc.pass_certificate_number, 1, 1)
                        ,substr(sc.pass_certificate_number, 2, 4)-1
                        ,'51-'
                        ,substr(sc.pass_certificate_number, 1, 5)
                        ,'00'
                        )
                WHEN substr(sc.pass_certificate_number, 6, 2) BETWEEN 01 AND 50 THEN 
                    CONCAT(
                        substr(sc.pass_certificate_number, 1, 5)
                        ,'01-'
                        ,substr(sc.pass_certificate_number, 1, 5)
                        ,'50'
                        )
                ELSE CONCAT(
                    substr(sc.pass_certificate_number, 1, 5)
                    ,'51-'
                    ,substr(sc.pass_certificate_number, 1, 1)
                    ,substr(sc.pass_certificate_number, 2, 4)+1
                    ,'00'
                    )
    END AS book
          , substr(sc.pass_certificate_number, 6, 2) AS cert_number
     FROM SPOILED_CERTIFICATES sc`;

  const args = [
  ];

  return mysql.format(template, args);
};
