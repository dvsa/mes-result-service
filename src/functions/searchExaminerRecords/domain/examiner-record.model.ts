import {CategoryCode, TestCentre} from '@dvsa/mes-test-schema/categories/common';

export interface ExaminerRecordModel {
  appRef: number;
  testCategory: CategoryCode;
  testCentre: TestCentre;
  routeNumber: number;
}
