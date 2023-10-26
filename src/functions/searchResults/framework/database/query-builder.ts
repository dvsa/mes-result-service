import MyBatis from 'mybatis-mapper';
import * as path from 'path';
import {QueryParameters} from '../../domain/query_parameters';

export const getSearchResultQuery = (queryParameters: QueryParameters): string => {
  // initialise MyBatis
  MyBatis.createMapper([path.resolve(__dirname, './mapper/results.xml')]);

  // generate SQL statement
  return MyBatis.getStatement(
    'searchResults', // <-- 'namespace' declared inside <mapper> tag
    'selectRows', // 'id' declared inside <sql> tag
    { ...queryParameters },
    { language: 'sql' }
  );
};
