import * as mysql from 'mysql2';
import { Mock, It, IMock } from 'typemoq';
import * as queryBuilder from '../../database/query-builder';
import * as database from '../../../../../common/framework/mysql/database';
import { Connection as PromiseConnection } from 'mysql2/promise';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { ExaminerRecordsQueryParameters } from '../../../domain/query_parameters';
import { getExaminerRecords } from '../search-repository';

describe('SearchRepository', () => {
  describe('getConciseSearchResults', () => {
    let mockMysqlConnection: IMock<mysql.Connection>;
    let mockQueryFunction: IMock<(sql: string, values?: any) => Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]>>;
    let mockEndFunction: IMock<() => void>;

    beforeEach(() => {
      mockQueryFunction = Mock.ofInstance((sql: string, values?: any) => new Promise(() => {
      }));
      mockEndFunction = Mock.ofInstance(() => {
      });
      mockMysqlConnection = Mock.ofType<mysql.Connection>();

      mockMysqlConnection
        .setup(x => x.promise())
        .returns(() => ({query: mockQueryFunction.object}) as PromiseConnection);

      mockMysqlConnection
        .setup(x => x.end())
        .returns(() => {
        });

      spyOn(database, 'getConnection').and.returnValue(mockMysqlConnection.object);
      spyOn(queryBuilder, 'getExaminerRecordsFromSearchQuery').and.returnValue('Mock SQL Query');
    });

    it('should return data on successful execution', async () => {
      const expectedData = [];
      const queryParameters = new ExaminerRecordsQueryParameters();
      queryParameters.startDate = '2015-10-10';
      queryParameters.endDate = '2019-12-12';
      const staffNumber = '87654321';

      mockQueryFunction
        .setup(x => x(It.isAnyString(), It.isAny()))
        .returns(async () => [expectedData, []] as [RowDataPacket[], FieldPacket[]]);

      mockEndFunction
        .setup(x => x())
        .returns(() => {
        });

      const result = await getExaminerRecords(queryParameters, staffNumber);

      expect(result).toEqual(expectedData);
      expect(queryBuilder.getExaminerRecordsFromSearchQuery).toHaveBeenCalledWith(queryParameters, staffNumber);
    });
  });
});
