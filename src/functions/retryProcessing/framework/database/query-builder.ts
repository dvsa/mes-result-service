import {
  successfullyProcessedQuery,
  updateErrorsToRetryQueryTemplate,
  updateErrorsToAbortQueryTemplate as abortTestsExceedingRetryQueryTemplate,
  supportInterventionQuery,
  getQueueRowsToDeleteQuery,
  getDeleteQueueRowsQuery,
  getUpdateQueueLoadStatusAndRetryCountQuery,
  getUpdateQueueLoadStatusQuery,
  getUpdateTestResultStatusQuery,
} from './query-templates';
import * as mysql from 'mysql2';
import moment = require('moment');

/**
 * Builds query to retrieve test results where TARS, RSIS and NOTIFY uploads
 * have been accepted
 *
 */
export const buildSuccessfullyProcessedQuery = () => mysql.format(successfullyProcessedQuery);

/**
 * Builds query to update the UPLOAD_QUEUE, resetting retry counts/status on all errors to retry.
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildUpdateErrorsToRetryQuery = (
  rsisRetryCount: number,
  notifyRetryCount: number,
  tarsRetryCount: number,
) => mysql.format(
  updateErrorsToRetryQueryTemplate,
  [rsisRetryCount, notifyRetryCount, tarsRetryCount],
);

/**
 * Builds query to update TEST_RESULT record to ERROR where there are interfaces that exceeded
 * the retry limit on any interface.
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildAbortTestsExceeingRetryQuery = (
  rsisRetryCount: number,
  notifyRetryCount: number,
  tarsRetryCount: number,
) => mysql.format(
  abortTestsExceedingRetryQueryTemplate,
  [rsisRetryCount, notifyRetryCount, tarsRetryCount],
);

/**
 * Builds query to retrieve support intervention results
 *
 * @param batchSize: number
 */
export const buildSupportInterventionQuery = () => mysql.format(supportInterventionQuery);

export const buildQueueRowsToDeleteQuery = (cutOffPointInDays: number) => {
  const startDate = moment().subtract(cutOffPointInDays, 'days').format('YYYY-MM-DD HH:mm:ss');

  return mysql.format(getQueueRowsToDeleteQuery(), [startDate]);
};

/**
 * Generic routine to Delete UPLOAD QUEUE rows
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
*/
export const buildDeleteQueueRowsQuery = (
  applicationReference: number,
  staffNumber: number,
  interfaceType: number,
) => mysql.format(
  getDeleteQueueRowsQuery(),
  [applicationReference, staffNumber, interfaceType],
);

/**
 * Generic routine to update UPLOAD QUEUE upload status and retry count
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
 * @param uploadStatusNameFrom
 * @param uploadStatusNameTo
 */
export const buildUpdateQueueLoadStatusAndRetryCountQuery = (
  applicationReference: number,
  staffNumber: number,
  interfaceType: number,
  uploadStatusNameFrom: string,
  uploadStatusNameTo: string,
  retryCount: number,
) => mysql.format(
  getUpdateQueueLoadStatusAndRetryCountQuery(),
  [
    uploadStatusNameTo,
    retryCount,
    applicationReference,
    staffNumber,
    interfaceType,
    uploadStatusNameFrom,
  ],
);

/**
 * Generic routine to update UPLOAD QUEUE upload status
 * @param applicationReference
 * @param staffNumber
 * @param interfaceType
 * @param uploadStatusNameFrom
 * @param uploadStatusNameTo
 */
export const buildUpdateQueueLoadStatusQuery = (
  applicationReference: number,
  staffNumber: number,
  interfaceType: number,
  uploadStatusNameFrom: string,
  uploadStatusNameTo: string,
) => mysql.format(
  getUpdateQueueLoadStatusQuery(),
  [uploadStatusNameTo, applicationReference, staffNumber, interfaceType, uploadStatusNameFrom],
);

/**
 * Generic routine to update TEST RESULT result status
 * @param applicationReference
 * @param staffNumber
 * @param resultStatusNameFrom
 * @param resultStatusNameTo
 */
export const buildUpdateTestResultStatusQuery = (
  applicationReference: number,
  staffNumber: number,
  resultStatusNameTo: string,
) => mysql.format(
  getUpdateTestResultStatusQuery(),
  [resultStatusNameTo, applicationReference, staffNumber],
);
