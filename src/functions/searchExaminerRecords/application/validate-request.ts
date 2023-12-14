import * as joi from 'joi';
import {QueryParameters} from '../../searchResults/domain/query_parameters';
import {ExaminerRole} from '@dvsa/mes-microservice-common/domain/examiner-role';

export const DATE_FORMAT = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
export const DATE_FORMAT_ERR_MSG
    = 'Please provide a valid date with the format \'YYYY-MM-DD\'';

const getExaminerRecordsSchema = (): joi.ObjectSchema<QueryParameters> => {
  return joi.object().keys({
    role: joi
      .string()
      .valid(ExaminerRole.DE, ExaminerRole.LDTM)
      .required(),
    startDate: joi
      .string()
      .regex(DATE_FORMAT)
      .required()
      .label(DATE_FORMAT_ERR_MSG),
    endDate: joi
      .string()
      .regex(DATE_FORMAT)
      .required()
      .label(DATE_FORMAT_ERR_MSG),
    staffNumber: joi
      .when('role', {
        is: joi.string().valid(ExaminerRole.DE),
        then: joi.string().alphanum().required(),
        otherwise: joi.string().alphanum().optional(),
      }),
  });
};

export const validateExaminerRecordsSchema = (queryParameters: QueryParameters) => {
  return getExaminerRecordsSchema().validate({
    role: queryParameters.role,
    staffNumber: queryParameters.staffNumber,
    startDate: queryParameters.startDate,
    endDate: queryParameters.endDate,
  });
};
