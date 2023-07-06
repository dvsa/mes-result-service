import * as mysql from 'mysql2';
import { SpoiledCertsQueryParameters } from '../../domain/query_parameters';

export const insertSpoiledCertQuery = (queryParameters: SpoiledCertsQueryParameters): string => {
  const template = `
      INSERT INTO SPOILED_CERTIFICATES (pass_certificate_number, staff_number, spoiled_date, tc_id, status, reason)
      VALUES (?, ?, ?, ?, ?, ?)
  `;

  const passCertificateNumber = queryParameters?.passCertificateNumber;
  const staffNumber = queryParameters?.staffNumber;
  const spoiledDate = queryParameters?.spoiledDate;
  const dtcCode = queryParameters?.dtcCode;
  const status = queryParameters?.status;
  const reason = queryParameters?.reason;

  // const args = [];

  return mysql.format(template, [
    passCertificateNumber,
    staffNumber,
    spoiledDate,
    dtcCode,
    status,
    reason,
  ]);
};
