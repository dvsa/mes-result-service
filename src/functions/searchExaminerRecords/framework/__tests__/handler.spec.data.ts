import { QueryParameters } from '../../domain/query_parameters';
import { TestResultRecord } from '../../../../common/domain/test-results';
import {ExaminerRecordModel} from '@dvsa/mes-microservice-common/domain/examiner-records';
import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';

// tslint:disable: variable-name

export const examinerRecord: ExaminerRecordModel[] = [{
  appRef: 1,
  testCentre: { centreId: 54321, costCode: 'EXTC1' },
  testCategory: TestCategory.B,
  startDate: '2019-06-26T09:07:00',
}];
