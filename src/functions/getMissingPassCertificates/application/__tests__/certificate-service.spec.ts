import { findBooksStaffNumbers, findGapsInBook, findMissingCerts } from '../certificate-service';
import { Cert100, certificates, noCerts } from './certificate-service.spec.data';

describe('certificate-service', () => {

  describe('findMissingCerts', () => {
    it('should return an array of books with missing certificates', () => {

      const result = findMissingCerts(certificates);
      expect(result).toEqual([
        {
          book: 'C1110001-C1110050',
          staffNumbers: ['123', '456'],
          testCentres: [1, 2],
          missingCertificates: ['C111003', 'C111004'],
        },
      ]);
    });

    it('should return an empty array when no certs are missing', () => {

      const result = findMissingCerts(noCerts);
      expect(result).toEqual([]);
    });

    it('should comprehend that 100 is the highest cert', () => {

      const result = findMissingCerts(Cert100);
      expect(result).toEqual([
        {
          book: 'C1110051-C1110100',
          staffNumbers: ['123'],
          testCentres: [2],
          missingCertificates: [
            'C111051', 'C111052', 'C111053', 'C111054', 'C111055', 'C111056', 'C111057',
            'C111058', 'C111059', 'C111060', 'C111061', 'C111062', 'C111063', 'C111064',
            'C111065', 'C111066', 'C111067', 'C111068', 'C111069', 'C111070', 'C111071',
            'C111072', 'C111073', 'C111074', 'C111075', 'C111076', 'C111077', 'C111078',
            'C111079', 'C111080', 'C111081', 'C111082', 'C111083', 'C111084', 'C111085',
            'C111086', 'C111087', 'C111088', 'C111089', 'C111090', 'C111091', 'C111092',
            'C111093', 'C111094', 'C111095', 'C111096', 'C111097', 'C111098', 'C111099',
          ],
        },
      ]);
    });
  });

  describe('findGapsInBook', () => {
    it('should return an array of missing certificates for a specific book', () => {

      const result = findGapsInBook(certificates, 'C1110001-C1110050');
      expect(result).toEqual(['C111003', 'C111004']);
    });
  });

  describe('findBooksStaffNumbers', () => {
    it('should return an array of staff numbers for a specific book', () => {
      const result = findBooksStaffNumbers(certificates, 'C1110001-C1110050');

      expect(result).toEqual(['123', '456']);
    });
  });

});
