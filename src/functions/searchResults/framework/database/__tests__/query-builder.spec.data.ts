import { QueryParameters } from '../../../domain/query_parameters';

export const queryParameter: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '1234570231',
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'true',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: 'false',
};

export const queryParameterRekey: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '1234570231',
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'true',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: 'true',
};

export const queryParameterRekeyWithoutStaffNumber: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '1234570231',
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'true',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: 'true',
};
