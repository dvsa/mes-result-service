import { TestResultRecord } from '../../../../common/domain/test-results';

export const noTestResults: TestResultRecord[] = [];

export const testResult: TestResultRecord[] =
  [{
    test_result: {
      category: 'B',
      testData: {
        ETA: {}, eco: {},
        manoeuvres: {},
        drivingFaults: {},
        seriousFaults: {},
        vehicleChecks: {
          showMeQuestion: {},
          tellMeQuestion: {},
        },
        controlledStop: {},
        dangerousFaults: {},
        testRequirements: {},
      },
      journalData: {
        examiner: {
          staffNumber: '01234567',
        },
        candidate: {
          gender: 'F',
          candidateId: 101,
          dateOfBirth: '1977-07-02',
          driverNumber: 'PEARS015220A99HC',
          candidateName: {
            title: 'Miss',
            lastName: 'Pearson',
            firstName: 'Florence',
          },
          mobileTelephone: '07654 123456',
          candidateAddress: {
            postcode: 'PO57 0DE',
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            addressLine3: 'Address Line 3',
            addressLine4: 'Address Line 4',
            addressLine5: 'Address Line 5',
          },
          ethnicOriginCode: 1271,
          primaryTelephone: '01234 567890',
          secondaryTelephone: '04321 098765',
        },
        testCentre: {
          centreId: 54321,
          costCode: 'EXTC1',
        },
        testSlotAttributes: {
          start: '2019-06-24T08:10:00',
          slotId: 1001,
          welshTest: false,
          extendedTest: false,
          specialNeeds: false,
          vehicleSlotType: 'B57mins',
        },
        applicationReference: {
          checkDigit: 1,
          applicationId: 1234567,
          bookingSequence: 3,
        },
      },
      testSummary: {
        D255: true,
        identification: 'Licence',
        weatherConditions: [
          'Icy',
        ],
        candidateDescription: 'Fgh',
        additionalInformation: 'Trh',
      },
      activityCode: '21',
      accompaniment: {},
      vehicleDetails: {
        registrationNumber: '',
      },
      instructorDetails: {},
      preTestDeclarations: {
        preTestSignature: '',
        insuranceDeclarationAccepted: false,
        residencyDeclarationAccepted: false,
      },
      postTestDeclarations: {
        postTestSignature: '',
        healthDeclarationAccepted: false,
        passCertificateNumberReceived: false,
      },
      communicationPreferences: {
        updatedEmail: '',
        communicationMethod: 'Post',
      },
    },
  }];

export const moreThanOneTestResult: TestResultRecord[] = [
  testResult[0],
  testResult[0],
];

export const applicationReference: number = 1234570231;
export const staffNumber = '1234570231';
