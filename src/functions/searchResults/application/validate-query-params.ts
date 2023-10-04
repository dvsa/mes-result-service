import joi from 'joi';
import {QueryParameters} from '../domain/query_parameters';

export class QueryParamValidator {
  private static DATE_REGEX = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
  private static DATE_VALIDATION_MSG = 'Please provide a valid date with the format \'YYYY-MM-DD\'';
  private queryParameters: QueryParameters;

  private static PARAMETER_SCHEMA = joi.object().keys({
    startDate: joi
      .string()
      .regex(QueryParamValidator.DATE_REGEX)
      .optional()
      .label(QueryParamValidator.DATE_VALIDATION_MSG),
    endDate: joi
      .string()
      .regex(QueryParamValidator.DATE_REGEX)
      .optional()
      .label(QueryParamValidator.DATE_VALIDATION_MSG),
    driverId: joi
      .string()
      .alphanum()
      .max(16)
      .optional(),
    staffNumber: joi
      .string()
      .alphanum()
      .optional(),
    rekey: joi
      .boolean()
      .optional(),
    dtcCode: joi
      .string()
      .alphanum()
      .optional(),
    appRef: joi
      .number()
      .max(1000000000000)
      .optional(),
    excludeAutoSavedTests: joi
      .string()
      .optional(),
    activityCode: joi
      .string()
      .alphanum()
      .optional(),
    category: joi
      .string()
      .optional(),
    passCertificateNumber: joi
      .string()
      .optional(),
  });

  constructor(queryParameters: QueryParameters) {
    this.queryParameters = queryParameters;
  }

  public getResult() {
    return QueryParamValidator.PARAMETER_SCHEMA.validate({
      driverId: this.queryParameters.driverNumber,
      staffNumber: this.queryParameters.staffNumber,
      rekey: this.queryParameters.rekey,
      dtcCode: this.queryParameters.dtcCode,
      appRef: this.queryParameters.applicationReference,
      startDate: this.queryParameters.startDate,
      endDate: this.queryParameters.endDate,
      excludeAutoSavedTests: this.queryParameters.excludeAutoSavedTests,
      activityCode: this.queryParameters.activityCode,
      category: this.queryParameters.category,
      passCertificateNumber: this.queryParameters.passCertificateNumber,
    });
  }
}
