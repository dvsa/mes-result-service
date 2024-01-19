import * as mysql from 'mysql2';
import {Mock, It, IMock} from 'typemoq';
import * as queryBuilder from '../../database/query-builder';
import * as database from '../../../../../common/framework/mysql/database';
import {Connection as PromiseConnection} from 'mysql2/promise';
import {FieldPacket, RowDataPacket} from 'mysql2';
import {getConciseSearchResults} from '../search-repository';
import {QueryParameters} from '../../../domain/query_parameters';

describe('SearchRepository', () => {
  describe('getConciseSearchResults', () => {
    let mockMysqlConnection: IMock<mysql.Connection>;
    let mockQueryFunction: IMock<(sql: string, values?: any) => Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]>>;
    let mockEndFunction: IMock<() => void>;

    beforeEach(() => {
      mockQueryFunction = Mock.ofInstance((sql: string, values?: any) => new Promise(() => {}));
      mockEndFunction = Mock.ofInstance( () => {});
      mockMysqlConnection = Mock.ofType<mysql.Connection>();

      mockMysqlConnection
        .setup(x => x.promise())
        .returns(() => ({ query: mockQueryFunction.object }) as PromiseConnection);

      mockMysqlConnection
        .setup(x => x.end())
        .returns(() => {});

      spyOn(database, 'getConnection').and.returnValue(mockMysqlConnection.object);
      spyOn(queryBuilder, 'getConciseSearchResultsFromSearchQuery').and.returnValue('Mock SQL Query');
    });

    it('should call getConciseSearchResultsFromSearchQuery with true if limitResults is true', async () => {
      const expectedData = [];

      mockQueryFunction
        .setup(x => x(It.isAnyString(), It.isAny()))
        .returns(async () => [expectedData, []] as [RowDataPacket[], FieldPacket[]]);

      mockEndFunction
        .setup(x => x())
        .returns(() => {});

      await getConciseSearchResults(new QueryParameters(), true);
      expect(queryBuilder.getConciseSearchResultsFromSearchQuery).toHaveBeenCalledWith(new QueryParameters(), true);
    });
    it('should call getConciseSearchResultsFromSearchQuery with false if limitResults is false', async () => {
      const expectedData = [];

      mockQueryFunction
        .setup(x => x(It.isAnyString(), It.isAny()))
        .returns(async () => [expectedData, []] as [RowDataPacket[], FieldPacket[]]);

      mockEndFunction
        .setup(x => x())
        .returns(() => {});

      await getConciseSearchResults(new QueryParameters(), false);
      expect(queryBuilder.getConciseSearchResultsFromSearchQuery).toHaveBeenCalledWith(new QueryParameters(), false);
    });

    it('should return data on successful execution', async () => {
      const expectedData = [];

      mockQueryFunction
        .setup(x => x(It.isAnyString(), It.isAny()))
        .returns(async () => [expectedData, []] as [RowDataPacket[], FieldPacket[]]);

      mockEndFunction
        .setup(x => x())
        .returns(() => {});

      const result = await getConciseSearchResults(new QueryParameters());

      expect(result).toEqual(expectedData);
    });
  });
});
