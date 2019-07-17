
export interface IRetryProcessor {
  processRetries(): Promise<void>;

  processSuccessful(): Promise<void>;

  processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void>;

  processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void>;

  processSupportInterventions(): Promise<void>;

  processOldEntryCleanup(cutOffPointInDays: number): Promise<void>;
}
