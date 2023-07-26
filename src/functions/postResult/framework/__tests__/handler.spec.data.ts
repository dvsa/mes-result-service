import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

export const sampleTest_12345678: TestResultSchemasUnion = {
  version: '0.0.1',
  category: null,
  journalData: {
    applicationReference: null,
    examiner: {
      staffNumber: '12345678',
    },
    testCentre: null,
    testSlotAttributes: null,
    candidate: null,
  },
  activityCode: null,
  rekey: false,
  changeMarker: false,
  examinerBooked: 12345678,
  examinerConducted: 12345678,
  examinerKeyed: 12345678,
};

export const sampleTest_87654321: TestResultSchemasUnion = {
  version: '0.0.1',
  category: null,
  journalData: {
    applicationReference: null,
    examiner: {
      staffNumber: null,
    },
    testCentre: null,
    testSlotAttributes: null,
    candidate: null,
  },
  activityCode: null,
  rekey: false,
  changeMarker: false,
  examinerBooked: 12345678,
  examinerConducted: 12345678,
  examinerKeyed: 87654321,
};

export const sampleTest_empty: TestResultSchemasUnion = {
  version: '0.0.1',
  category: null,
  journalData: {
    applicationReference: null,
    examiner: {
      staffNumber: null,
    },
    testCentre: null,
    testSlotAttributes: null,
    candidate: null,
  },
  activityCode: null,
  rekey: false,
  changeMarker: false,
  examinerBooked: 12345678,
  examinerConducted: 12345678,
  examinerKeyed: null,
};
