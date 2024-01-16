import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import {TestCentre, QuestionResult, IndependentDriving} from '@dvsa/mes-test-schema/categories/common';
import {Circuit} from '@dvsa/mes-test-schema/categories/AM1';


export interface ExaminerRecordModel {
  appRef: number;
  testCategory: TestCategory;
  testCentre: TestCentre;
  routeNumber: Number;
  startDate: string;
  controlledStop?: boolean;
  independentDriving?: IndependentDriving;
  circuit?: Circuit;
  safetyQuestions?: QuestionResult[];
  balanceQuestions?: QuestionResult[];
  manoeuvres?: any;
  vehicleChecks?: any;
}
