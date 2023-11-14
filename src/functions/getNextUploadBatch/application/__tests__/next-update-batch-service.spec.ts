import { IMock, Mock, It } from 'typemoq';
import { getNextUploadBatch } from '../next-update-batch-service';
import { BatchRepository } from '../../framework/repositories/batch-repository';
import { TestResultRecord } from '../../../../common/domain/test-results';

describe('NextUpdateBatchService', () => {
  let mockBatchRepository: IMock<BatchRepository>;
  const mockData: TestResultRecord[] = [];
  const batchSize = 10;
  const interfaceType = 'someInterfaceType';

  beforeEach(() => {
    mockBatchRepository = Mock.ofType<BatchRepository>();

    // Set up the mocked method
    mockBatchRepository
      .setup(x => x.getUploadQueueData(It.isAnyNumber(), It.isAnyString()))
      .returns(async () => mockData);
  });

  describe('getNextUploadBatch', () => {
    it('should call getUploadQueueData with parameters and return data', async () => {
      spyOn(BatchRepository.prototype, 'getUploadQueueData').and.returnValue(Promise.resolve(mockData));

      const result = await getNextUploadBatch(batchSize, interfaceType);

      expect(BatchRepository.prototype.getUploadQueueData).toHaveBeenCalledWith(batchSize, interfaceType);
      expect(result).toEqual(mockData);
    });
  });
});
