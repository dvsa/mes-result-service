import {get} from 'lodash';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {SearchResultTestSchema} from '@dvsa/mes-search-schema';
import {TestResultRecord} from '../../../common/domain/test-results';

export class TestResultMapper {
  private testResults: TestResultRecord[];

  constructor(results: TestResultRecord[]) {
    this.testResults = results;
  }

  public format(): SearchResultTestSchema[] {
    return this.testResults
      .map((row) => row.test_result)
      .map((testResultRow) => ({
        costCode: testResultRow.journalData.testCentre.costCode,
        testDate: testResultRow.journalData.testSlotAttributes.start,
        driverNumber: testResultRow.journalData.candidate.driverNumber,
        candidateName: testResultRow.journalData.candidate.candidateName,
        applicationReference: formatApplicationReference(testResultRow.journalData.applicationReference),
        category: testResultRow.category,
        activityCode: testResultRow.activityCode,
        passCertificateNumber: get(testResultRow, 'passCompletion.passCertificateNumber', null),
        grade: get(testResultRow, 'testData.review.grade', null),
      }));
  }
}
