import { validateMESJoiSchema, getTestCategory, getCategorySpecificSchema } from '../mes-joi-schema-service';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

import * as catBSchema from '@dvsa/mes-test-schema/categories/B/index.json';
import * as catBESchema from '@dvsa/mes-test-schema/categories/BE/index.json';
import * as catCSchema from '@dvsa/mes-test-schema/categories/C/index.json';
import * as catAM1Schema from '@dvsa/mes-test-schema/categories/AM1/index.json';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';

describe('Joi schema validation service', () => {
  const validationErrorName = 'ValidationError';
  const startValidationErrorMessage = 'child "journalData" fails because' +
    ' [child "testSlotAttributes" fails because [child "start" fails because ["start" length' +
    ' must be less than or equal to 19 characters long]]]';
  const requiredFieldMissingErrorMessage = 'child "journalData" fails because ' +
    '[child "applicationReference" fails because ["applicationReference" is required]]';

  it('should return a validation error if \'testSlotAttributes.start\' schema validation fails', () => {
    const invalidSchema = {
      version: '0.0.1',
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: '1'.repeat(20), // start exceeds max-length (19 characters)
          vehicleSlotType: 'mock',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
        applicationReference: {
          applicationId: 12,
          bookingSequence: 222,
          checkDigit: 1,
        },
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error.message).toEqual(startValidationErrorMessage);
    expect(validationResult.error.name).toEqual(validationErrorName);
  });

  it('should not return a validation error if \'testSlotAttributes.start\' is valid', () => {
    const invalidSchema = {
      version: '0.0.1',
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: '1'.repeat(19), // start does not exceed max-length (19 characters)
          vehicleTypeCode: 'C',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
        applicationReference: {
          applicationId: 12,
          bookingSequence: 222,
          checkDigit: 1,
        },
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error).toBeNull();
  });

  it('should return a validation error if required property is missing from schema', () => {
    const invalidSchema = {
      version: '0.0.1',
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: 'ABCDEFGHIJKLMNOPQRS',
          vehicleTypeCode: 'C',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
        // missing required property 'applicationReference'
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };

    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error.message).toEqual(requiredFieldMissingErrorMessage);
    expect(validationResult.error.name).toEqual(validationErrorName);
  });
});

describe('getTestCategory', () => {
  it('should return the category of schema', () => {
    const schema = {
      version: '0.0.1',
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: 'ABCDEFGHIJKLMNOPQRS',
          vehicleTypeCode: 'C',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const category = getTestCategory(schema as TestResultSchemasUnion);
    expect(category).toEqual(TestCategory.B);
  });
});

describe('getCategorySpecificSchema', () => {
  it('should return Category B schema', () => {
    const schema = getCategorySpecificSchema(TestCategory.B);
    expect(schema).toEqual(catBSchema);
  });

  it('should return Category BE schema', () => {
    const schema = getCategorySpecificSchema(TestCategory.BE);
    expect(schema).toEqual(catBESchema);
  });

  it('should return Category C schema', () => {
    const schema = getCategorySpecificSchema(TestCategory.C);
    expect(schema).toEqual(catCSchema);
  });

  it('should return Category A Mod1 schema for a EUAMM1 test', () => {
    const schema = getCategorySpecificSchema(TestCategory.EUAMM1);
    expect(schema).toEqual(catAM1Schema);
  });

  it('should return Category A Mod1 schema for a EUAM1 test', () => {
    const schema = getCategorySpecificSchema(TestCategory.EUAM1);
    expect(schema).toEqual(catAM1Schema);
  });

  it('should return Category A Mod1 schema for a EUA1M1 test', () => {
    const schema = getCategorySpecificSchema(TestCategory.EUA1M1);
    expect(schema).toEqual(catAM1Schema);
  });

  it('should return Category A Mod1 schema for a EUA2M1 test', () => {
    const schema = getCategorySpecificSchema(TestCategory.EUA2M1);
    expect(schema).toEqual(catAM1Schema);
  });

  it('should use Category B as default', () => {
    const schema = getCategorySpecificSchema(null);
    expect(schema).toEqual(catBSchema);
  });
});
