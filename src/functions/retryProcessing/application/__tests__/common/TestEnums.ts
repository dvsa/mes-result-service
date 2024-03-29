export enum InterfaceIds {
  TARS,
  NOTIFY,
  RSIS,
}

export enum RetryTestCases {
  UploadedNotProcessed = 1,
  FailedValidation = 2,
  PendingTars = 3,
  PendingRsis = 4,
  PendingNotify = 5,
  PendingTarsAndRsis = 6,
  PendingTarsAndNotify = 7,
  PendingRsisAndNotify = 8,
  SuccessfulUpload = 9,
  SuccessfulUploadTerminatedNoNotify = 10,
  FailedTars = 11,
  FailedRsis = 12,
  FailedNotify = 13,
  FailedTarsAndRsis = 14,
  FailedTarsAndNotify = 15,
  FailedRsisAndNotify = 16,
  FailedTarsRsisAndNotify = 17,
  RetryTars = 18,
  RetryRsis = 19,
  RetryNotify = 20,
  RetryTarsAndRsis = 21,
  RetryTarsAndNotify = 22,
  RetryRSISAndNotify = 23,
  RetryTarsRsisAndNotify = 24,
  FailedTarsExceeded = 25,
  FailedRsisExceeded = 26,
  FailedNotifyExceeded = 27,
  FailedTarsAndRsisExceeded = 28,
  FailedTarsAndNotifyExceeded = 29,
  FailedRSISAndNotifyExceeded = 30,
  FailedTarsRSISAndNotifyExceeded = 31,
  FailedTarsError = 32,
  FailedRsisError = 33,
  FailedNotifyError = 34,
  FailedTarsAndRsisError = 35,
  FailedTarsAndNotifyError = 36,
  FailedRsisAndNotifyError = 37,
  FailedTarsRsisAndNotifyError = 38,
  FailedTarsPending = 39,
  FailedRsisPending = 40,
  FailedNotifyPending = 41,
  FailedTarsAndRsisPending = 42,
  FailedTarsAndNotifyPending = 43,
  FailedRsisAndNotifyPending = 44,
  FailedTarsRsisAndNotifyPending = 45,
  FailedTarsRetry = 46,
  FailedRsisRetry = 47,
  FailedNotifyRetry = 48,
  FailedTarsAndRsisRetry = 49,
  FailedTarsAndNotifyRetry = 50,
  FailedRsisAndNotifyRetry = 51,
  FailedTarsRsisAndNotifyRetry = 52,
  SuccessfulUploadAfterMonth = 53,
  AcceptedTarsNotifyAndRsisProcessing = 54,
  AcceptedTarsNotifyFailed = 55,
}

export enum RetryUploadCleanUpTestCases {
  TarsAcceptedNotifyAcceptedRsisAccepted = 56,
  TarsAcceptedNotifyAcceptedRsisProcessing = 57,
}

export enum SuccessfulTestCases {
  TarsProcessingNotifyProcessing = 58,
  TarsAcceptedNotifyProcessing = 59,
  TarsProcessingNotifyAccepted = 60,
  TarsAcceptedNotifyAccepted = 61,
}

export enum ErrorsToRetryTestCases {
  TarsFailedRsisFailed = 65,
  TarsFailedRsisProcessing = 66,
  TarsFailedRsisAccepted = 67,
  TarsProcessingRsisFailed = 68,
  TarsAcceptedRsisFailed = 69,
}

export enum ErrorsToAbortTestCases {
  TarsFailedNotifyFailed = 70,
  TarsFailedNotifyProcessing = 71,
  TarsFailedNotifyAccepted = 72,
  TarsProcessingNotifyFailed = 73,
  TarsAcceptedNotifyFailed = 74,
  TarsAcceptedNotifyAccepted = 75,
  TarsProcessingNotifyProcessing = 76,
}

export enum SupportInterventionTestCases {
  AutosaveNoUploadRecords = 77,
  FullSubNoUploadRecords = 78,
  FullSubTarsProcRsisFailNotifyProc = 79,
  FullSubTarsAcceptRsisFailNotifyFail = 80,
  FullSubAllThreeFail = 81,
  FullSubTarsAcceptRsisFailNotifyAccept = 82,
  AutosaveTarsFailNotifyProc = 83,
  AutosaveTarsFailNotifyFail = 84,
  AutosaveTarsFailNotifyAccept = 85,
}

export enum StalledSubmissionTestResultCases {
  AutosavedDateInPastNoRsisUpload = 86,
  AutosavedDateNotInPastNoRsisUpload = 87,
  NotAutosavedDateInPastNoRsisUpload = 88,
  NotAutosavedDateNotInPastNoRsisUpload = 89,
}
