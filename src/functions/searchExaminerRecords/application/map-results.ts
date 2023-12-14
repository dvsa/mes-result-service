import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {get} from 'lodash';
import {ExaminerRecordModel} from '../domain/examiner-record.model';

export const formatForExaminerRecords = (testResult: TestResultSchemasUnion): ExaminerRecordModel => {
  return {
    appRef: formatApplicationReference(get(testResult, 'journalData.applicationReference')),
    testCategory: get(testResult, 'category'),
    testCentre: get(testResult, 'journalData.testCentre'),
    routeNumber: get(testResult, 'testSummary.routeNumber'),
  };
};
