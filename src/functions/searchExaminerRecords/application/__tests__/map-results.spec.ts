import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {formatForExaminerRecords} from '../map-results';
import {ExaminerRecordModel} from '../../domain/examiner-record.model';
import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';

describe('Map results', () => {
  it('should map the results into an examiner record model', () => {
    const mockTestResult = {
      journalData: {
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
      testSummary: {
        routeNumber: 1,
      },
    } as TestResultSchemasUnion;

    const res = formatForExaminerRecords(mockTestResult);

    expect(res).toEqual({
      appRef: 123456223,
      testCategory: TestCategory.B,
      testCentre: { centreId: 1, centreName: 'Example test centre', costCode: 'EXTC1' },
      routeNumber: 1,
    } as ExaminerRecordModel);
  });
});
