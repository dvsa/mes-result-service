export interface RegeneratedEmailsRecord {
  appRef:                   number;
  emailRegenerationDetails: EmailRegenerationDetail[];
}

export interface EmailRegenerationDetail {
  newEmail:        string;
  newLanguage:     string;
  regeneratedDate: string;
}
