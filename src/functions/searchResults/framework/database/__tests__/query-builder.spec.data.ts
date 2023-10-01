import { QueryParameters } from '../../../domain/query_parameters';

export const queryParameter: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '12345670231', // 11 digit staff number
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'true',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: false,
};

export const queryParameterRekey: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '12345678', // 8 digit staff number
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'true',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: true,
};
