import {ExaminerRole} from '@dvsa/mes-microservice-common/domain/examiner-role';

export class QueryParameters {
  startDate : string;
  staffNumber: string;
  endDate: string;
  driverNumber: string;
  dtcCode: string;
  applicationReference: string;
  excludeAutoSavedTests: string;
  activityCode: string;
  category: string;
  passCertificateNumber: string;
  rekey: boolean;
}
