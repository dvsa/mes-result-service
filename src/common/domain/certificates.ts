export interface Certificates {
  pass_certificate_number: string;
  staff_number: string;
  test_centre_id: number;
  test_centre: string;
  test_date: Date;
  book: string;
  cert_number: string;
}

export interface Books{
  book: string;
  staffNumbers: string[];
  testCentres: number[];
  missingCertificates: string[];
}
