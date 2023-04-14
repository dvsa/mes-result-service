export interface RegeneratedEmailsRecord {
  appRef:                   number;
  emailRegenerationDetails: EmailRegenerationDetail[];
}

export interface EmailRegenerationDetail {
  new_email:        string;
  new_language:     string;
  regenerated_date: Date;
}
