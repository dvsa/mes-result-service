import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {formatForExaminerRecords} from '../map-results';
import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import {ExaminerRecordModel} from '../../domain/examiner-record.model';

describe('Map results', () => {
  it('should map the results into an examiner record model', () => {
    const mockTestResult = {
      journalData: {
        testSlotAttributes: {start: '11-11-2011'},
        applicationReference: {
          applicationId: 123456,
          bookingSequence: 22,
          checkDigit: 3,
        },
        testCentre: {
          centreId: 1,
          centreName: 'Example test centre',
          costCode: 'EXTC1',
        },
      },
      category: TestCategory.B,
      testData: {
        controlledStop: {selected: true},
        manoeuvres: {reverseRight: {selected: true}},
        vehicleChecks: {
          tellMeQuestion: {code: '2'},
          showMeQuestion: {code: '1'},
        },
      },
      testSummary: {
        independentDriving: 'Sat nav',
        routeNumber: 1,
      },
    } as TestResultSchemasUnion;

    const res: ExaminerRecordModel = formatForExaminerRecords(mockTestResult);

    expect(res).toEqual(
      {
        appRef: 123456223,
        testCategory: TestCategory.B,
        testCentre: {centreId: 1, centreName: 'Example test centre', costCode: 'EXTC1'},
        routeNumber: 1,
        startDate: '11-11-2011',
        controlledStop: true,
        independentDriving: 'Sat nav',
        manoeuvres: {reverseRight: {selected: true}},
        showMeQuestions: [{code: '1'}],
        tellMeQuestions: [{code: '2'}],
      });
  });
})
;
