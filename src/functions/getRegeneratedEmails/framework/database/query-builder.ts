import * as mysql from 'mysql2';

export const buildGetRegeneratedEmailQuery = (appRef: number): string => {
  const template = `
    SELECT application_reference as appRef,
           JSON_ARRAYAGG(
                JSON_OBJECT(
                    'new_email', new_email,
                    'regenerated_date', regenerated_date,
                    'new_language', new_language
                )
           ) as emailRegenerationDetails
    FROM AUDIT_EMAIL_REGEN where application_reference = ?;
 `;

  return mysql.format(template, [appRef]);
};
