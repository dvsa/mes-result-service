import {QueryParameters} from '../domain/query_parameters';

export const isSearchingForOwnTests = (queryParameters: QueryParameters, staffNumber: string): boolean => {
  return queryParameters && queryParameters.staffNumber === staffNumber;
};
