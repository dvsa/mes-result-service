import * as joi from 'joi';
import { ExaminerRecordsQueryParameters } from '../domain/query_parameters';

export const DATE_FORMAT = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
export const DATE_FORMAT_ERR_MSG
  = 'Please provide a valid date with the format \'YYYY-MM-DD\'';

const getExaminerRecordsSchema = (): joi.ObjectSchema<ExaminerRecordsQueryParameters> => {
  return joi.object().keys({
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
      .string()
      .alphanum()
      .required(),
  });
};

export const validateExaminerRecordsSchema = (queryParameters: ExaminerRecordsQueryParameters) => {
  return getExaminerRecordsSchema().validate({
    staffNumber: queryParameters.staffNumber,
    startDate: queryParameters.startDate,
    endDate: queryParameters.endDate,
  });
};
