import {IMock, It, Mock} from 'typemoq';
import * as mysql from 'mysql2';
import {Connection as PromiseConnection} from 'mysql2/promise';
import * as database from '../../../../../common/framework/mysql/database';
import * as queryBuilder from '../../database/query-builder';
import {TestResultRecord} from '../../../../../common/domain/test-results';
import {FieldPacket, RowDataPacket} from 'mysql2';
import {BatchRepository} from '../batch-repository';

describe('BatchRepository', () => {
  let mockMysqlConnection: IMock<mysql.Connection>;
  let mockQueryFunction: IMock<(sql: string, values?: any) => Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]>>;

  beforeEach(() => {
    mockQueryFunction = Mock.ofInstance((sql: string, values?: any) => new Promise(() => {}));
    mockMysqlConnection = Mock.ofType<mysql.Connection>();
    mockMysqlConnection
      .setup(x => x.promise())
      .returns(() => ({ query: mockQueryFunction.object }) as PromiseConnection);

    spyOn(database, 'getConnection').and.returnValue(mockMysqlConnection.object);

    spyOn(queryBuilder, 'buildTarsNextBatchQuery').and.returnValue('Mock SQL Query');
  });

  it('should correctly get upload queue data', async () => {
    const mockData: TestResultRecord[] = [];
    const batchSize = 10;
    const interfaceType = 'someInterfaceType';

    mockQueryFunction
      .setup(x => x(It.isAnyString(), It.isAny()))
      .returns(async () => [mockData, []] as [RowDataPacket[], FieldPacket[]]);

    const repo = new BatchRepository();
    const result = await repo.getUploadQueueData(batchSize, interfaceType);

    expect(result).toEqual(mockData);
  });
});
