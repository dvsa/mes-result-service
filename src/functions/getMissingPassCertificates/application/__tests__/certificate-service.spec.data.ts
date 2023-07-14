import { Certificates } from '../../../../common/domain/certificates';

export const certificates: Certificates[] = [
  {
    pass_certificate_number: 'C1110001',
    staff_number: '123',
    test_centre_id: 1,
    test_centre: 'TC1',
    test_date: new Date(),
    book: 'C1110001-C1110050',
    cert_number: '01',
  },
  {
    pass_certificate_number: 'C1110002',
    staff_number: '123',
    test_centre_id: 1,
    test_centre: 'TC1',
    test_date: new Date(),
    book: 'C1110001-C1110050',
    cert_number: '02',
  },
  {
    pass_certificate_number: 'C1110005',
    staff_number: '456',
    test_centre_id: 2,
    test_centre: 'TC2',
    test_date: new Date(),
    book: 'C1110001-C1110050',
    cert_number: '05',
  },
];

export const noCerts: Certificates[] = [];

export const Cert100: Certificates[] = [
  {
    pass_certificate_number: 'C1110100',
    staff_number: '123',
    test_centre_id: 2,
    test_centre: 'TC2',
    test_date: new Date(),
    book: 'C1110051-C1110100',
    cert_number: '00',
  },
];
