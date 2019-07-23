
export interface IRetryProcessor {
  processSuccessful(): Promise<number>;

  processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<number>;

  processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<number>;

  processSupportInterventions(): Promise<void>;

  processOldEntryCleanup(cutOffPointInDays: number): Promise<void>;
}
