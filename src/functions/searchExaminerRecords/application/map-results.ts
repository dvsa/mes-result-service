import {TestResultSchemasUnion} from '@dvsa/mes-test-schema/categories';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {get} from 'lodash';
import {ExaminerRecordModel} from '../domain/examiner-record.model';
import {TestCategory} from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import { TestCentre, QuestionResult } from '@dvsa/mes-test-schema/categories/common';

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
  ].forEach(value => {
    if (get(testResult, value.path)) {
      result = {
        ...result,
        [value.value]: get(testResult, value.path),
      };
    }
  });

  if (get(testResult, 'testData.vehicleChecks.showMeQuestion') ||
      get(testResult, 'testData.vehicleChecks.showMeQuestions')) {
    result = {
      ...result,
      showMeQuestions: [
        ...[get(testResult, 'testData.vehicleChecks.showMeQuestion', null)] as [QuestionResult],
        ...get(testResult, 'testData.vehicleChecks.showMeQuestions', []) as QuestionResult[],
      ],
    };
  }

  if (get(testResult, 'testData.vehicleChecks.tellMeQuestion') ||
      get(testResult, 'testData.vehicleChecks.tellMeQuestions')) {
    result = {
      ...result,
      tellMeQuestions: [
        ...[get(testResult, 'testData.vehicleChecks.tellMeQuestion', null)] as [QuestionResult],
        ...get(testResult, 'testData.vehicleChecks.tellMeQuestions', []) as QuestionResult[],
      ],
    };
  }

  console.log(result);
  return result;
};
