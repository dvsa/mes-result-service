import { Certificates } from '../../../common/domain/certificates';

/**
 * Construct a payload for each book with missing certificates
 * @param certificates
 */
export const findMissingCerts = ((certificates: Certificates[]):any => {
  const userBooks = certificates.map(cert => cert.book);
  const uniqueBooks = Array.from(new Set(userBooks));

  const booksWithMissingCerts = [];
  uniqueBooks.forEach((book) => {
    // test centres where certs were issued
    const testCentres = certificates
      .filter(certs => certs.book === book)
      .map(certs => certs.test_centre_id);

    const uniqueTestCentres = Array.from(new Set(testCentres));

    const temp = {
      book,
      staffNumbers: findBooksStaffNumbers(certificates, book),
      testCentres: uniqueTestCentres,
      missingCertificates: findGapsInBook(certificates, book),
    };

    if (temp.missingCertificates.length > 0) booksWithMissingCerts.push(temp);
  });

  return booksWithMissingCerts;
});

/**
 * Identify and return all missing certificates for a specific book
 * @param certs
 * @param book
 */
export const findGapsInBook = (certs: Certificates[], book: string): number[] => {
  const missing = [];

  // extract all certificate numbers issued from a book,sorted (asc) with duplicates removed
  const foundCerts = certs
    .filter(certs => certs.book === book)
    // for comparison purposes remap a 00 as 100
    .map(certs => +certs.cert_number === 0 ? 100 : +certs.cert_number)
    .sort((a, b) => a - b)
    // remove duplicates
    .filter((value, index, self) => self.indexOf(value) === index);

  // set an appropriate start range based upon certificates issued from the book, 1 or 51
  const startRange: number = foundCerts[foundCerts.length - 1] < 51 ? 1 : 51;

  // find all certificates that haven't been issued prior to the highest issued and return
  // as the full certificate number taking the scenario of 100 breaking the pattern into account
  for (let i = startRange; i <= foundCerts[foundCerts.length - 1]; i++) {
    if (!foundCerts.includes(i)) {
      let missingCert: string;
      if (i === 100) {
        missingCert = book.substring(7, 11).concat(i.toString());
      } else {
        missingCert = book.slice(0, 5).concat(i.toString().padStart(2, '0'));
      }
      missing.push(missingCert);
    }
  }

  return missing;
};

/**
 * Identify and return all staff that have issued certificates from book
 * @param certs
 * @param book
 */
export const findBooksStaffNumbers = (certs: Certificates[], book: string): string[] => {

  const staffNumbers = certs
    .filter(certs => certs.book === book)
    .map((cert) => {
      return cert.staff_number;
    })
    // remove duplicates
    .filter((value, index, self) => self.indexOf(value) === index)
  ;

  return staffNumbers;
};
