import { QueryParameters } from '../../domain/query_parameters';
import { TestResultRecord } from '../../../../common/domain/test-results';

export const queryParameter: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '1234570231',
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'false',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: false,
};

export const queryParameterWith8DigitAppRef: QueryParameters = {
  startDate: '2015-10-10',
  endDate: '2019-12-12',
  staffNumber: '00123456',
  driverNumber: 'SHAWX885220A99HC',
  applicationReference: '12345702',
  dtcCode: 'EXTC1',
  excludeAutoSavedTests: 'false',
  category: 'C',
  activityCode: '2',
  passCertificateNumber: 'A123456X',
  rekey: false,
};

export const testResultResponse = [
  {
    costCode: 'EXTC1',
    testDate: '2019-06-26T09:07:00',
    driverNumber: 'DOEXX625220A99HC',
    applicationReference: 1234569019,
    category: 'B',
    activityCode: '2',
    candidateName: 'candidatename',
    passCertificateNumber: 'A123456X',
    grade: null,
  },
];

export const testResult: TestResultRecord[] = [{
  test_result: {
    category: 'B',
    testData:
    {
      ETA: { physical: true },
      eco: { completed: true },
      manoeuvres: { reverseRight: [Object] },
      drivingFaults: { moveOffSafety: 2, controlsAccelerator: 1 },
      seriousFaults: { controlsAccelerator: true },
      vehicleChecks: { showMeQuestion: [Object], tellMeQuestion: [Object] },
      controlledStop: { fault: 'DF', selected: true },
      eyesightTest: { complete: true, seriousFault: false },
      dangerousFaults: { useOfSpeed: true },
      testRequirements:
      {
        hillStart: true,
        angledStart: true,
        normalStart1: true,
        normalStart2: true,
      },
    },
    journalData:
    {
      examiner: { staffNumber: '01234567', individualId: 9000001 },
      candidate:
      {
        gender: 'F',
        candidateId: 103,
        dateOfBirth: '1989-05-13',
        driverNumber: 'DOEXX625220A99HC',
        emailAddress: 'jane.doe@example.com',
        candidateName: 'candidatename',
        mobileTelephone: '07654 123456',
        candidateAddress: [Object],
        ethnicOriginCode: 1272,
      },
      testCentre: { centreId: 54321, costCode: 'EXTC1' },
      testSlotAttributes:
      {
        start: '2019-06-26T09:07:00',
        slotId: 1003,
        welshTest: false,
        extendedTest: false,
        specialNeeds: true,
        vehicleSlotType: 'B57mins',
        examinerVisiting: false,
      },
      applicationReference: { checkDigit: 9, applicationId: 1234569, bookingSequence: 1 },
    },
    testSummary:
    {
      D255: true,
      identification: 'Licence',
      debriefWitnessed: true,
      weatherConditions: ['Bright / wet roads', 'Showers'],
      independentDriving: 'Sat nav',
    },
    activityCode: '2',
    accompaniment: {},
    vehicleDetails: { gearboxCategory: 'Manual', registrationNumber: 'ABC' },
    instructorDetails: {},
    preTestDeclarations:
    {
      preTestSignature: 'data:image/svg+xml;base64,hY2siPjwvY2lyY2xlPjwvc3ZnPg==',
      insuranceDeclarationAccepted: true,
      residencyDeclarationAccepted: true,
    },
    postTestDeclarations:
    {
      postTestSignature: '',
      healthDeclarationAccepted: false,
      passCertificateNumberReceived: false,
    },
    communicationPreferences:
    {
      updatedEmail: 'jane.doe@example.com',
      communicationMethod: 'Email',
    },
    passCompletion: { passCertificateNumber: 'A123456X' },
  },
}];
