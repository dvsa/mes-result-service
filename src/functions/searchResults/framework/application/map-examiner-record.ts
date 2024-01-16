import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {get} from 'lodash';
import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import { TestCentre } from '@dvsa/mes-test-schema/categories/common';
import {ExaminerRecordModel} from '../../domain/examiner-record.model';

export const formatForExaminerRecords = (testResult: TestResultSchemasUnion): ExaminerRecordModel => {
  let result: ExaminerRecordModel = {
    appRef: formatApplicationReference(get(testResult, 'journalData.applicationReference')),
    testCategory: get(testResult, 'category') as TestCategory,
    testCentre: get(testResult, 'journalData.testCentre') as TestCentre,
    routeNumber: Number(get(testResult, 'testSummary.routeNumber')),
    startDate: testResult.journalData.testSlotAttributes.start,
  };

  [
    {value: 'controlledStop', path: 'testData.controlledStop.selected'},
    {value: 'independentDriving', path: 'testSummary.independentDriving'},
    {value: 'circuit', path: 'testSummary.circuit'},
    {value: 'safetyQuestions', path: 'testData.safetyAndBalanceQuestions.safetyQuestions'},
    {value: 'balanceQuestions', path: 'testData.safetyAndBalanceQuestions.balanceQuestions'},
    {value: 'manoeuvres', path: 'testData.manoeuvres'},
    {value: 'vehicleChecks', path: 'testData.vehicleChecks'},
  ].forEach(value => {
    const pathValue = get(testResult, value.path);
    if (pathValue) {
      result = {
        ...result,
        [value.value]: pathValue,
      };
    }
  });

  console.log(result);
  return result;
};
