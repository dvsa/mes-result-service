import { RegeneratedEmailsRecord } from '../../../../common/domain/regenerated-emails';

// tslint:disable: variable-name
export const sampleToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1zeE1\KTUxDSURXTVRQdlp5SjZ0eC1DRHh\
3MCIsImtpZCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh3MCJ9.eyJhdWQiOiIwOWZkZDY4Yy00ZjJmLTQ1YzItYmU1N\
S1kZDk4MTA0ZDRmNzQiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82YzQ0OGQ5MC00Y2ExLTRjYWYtYWI1OS0w\
YTJhYTY3ZDc4MDEvIiwiaWF0IjoxNTUxODAxMjIwLCJuYmYiOjE1NTE4MDEyMjAsImV4cCI6MTU1MTgwMjcyMCwiYWNyIjo\
iMSIsImFpbyI6IjQySmdZTENVTXI4cTFocVNmMTdpVVcwSGErWVIzcHkwYjU0SjJwK3YySzRwRFBaOEd3NEEiLCJhbXIiOl\
sicHdkIl0sImFwcGlkIjoiMDlmZGQ2OGMtNGYyZi00NWMyLWJlNTUtZGQ5ODEwNGQ0Zjc0IiwiYXBwaWRhY3IiOiIwIiwiZ\
Xh0bi5lbXBsb3llZUlkIjpbIjEyMzQ1Njc4Il0sImlwYWRkciI6IjE0OC4yNTMuMTM0LjIxMyIsIm5hbWUiOiJNRVNCZXRh\
IHVzZXIiLCJvaWQiOiI4ZDU3OWFiZS0zODc4LTQ1ZDctOTVlYi1jMjA5OTk1NTYwZTUiLCJwd2RfZXhwIjoiNTkxNDUxIiw\
icHdkX3VybCI6Imh0dHBzOi8vcG9ydGFsLm1pY3Jvc29mdG9ubGluZS5jb20vQ2hhbmdlUGFzc3dvcmQuYXNweCIsInNjcC\
I6IkRpcmVjdG9yeS5SZWFkLkFsbCBVc2VyLlJlYWQiLCJzdWIiOiI2am9DUkpQQTFQaTdBWXVtZ1ZNMURSZG96ZFpyN0lRZ\
XJkaURoUG9GWXNJIiwidGlkIjoiNmM0NDhkOTAtNGNhMS00Y2FmLWFiNTktMGEyYWE2N2Q3ODAxIiwidW5pcXVlX25hbWUi\
OiJtb2JleGFtaW5lckBkdnNhZ292Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6Im1vYmV4YW1pbmVyQGR2c2Fnb3Yub25taWN\
yb3NvZnQuY29tIiwidXRpIjoieFYyZWFOZUU2MG1HTkpRWUZWSXNBQSIsInZlciI6IjEuMCJ9.dfuRICPaGJJh4WcWdjYP8\
waHrRVFWBuik6dZLTlXrXPnsUWDf7Piq9CrZjR6qEEJoBlKTcw6vgF1WTaUvikLwtl6VTaIMfqbp1niajJOhjxZjWd2p2cm\
Mr7SfbJkD33tHIuG0w71qZBTCacS9PjxrmTv9Qe6QRRsI-kSOwsF-u2L1-kL6iO67LdZa04jxTJVZ3P0IEh1MQBV7FOzCDD\
KiSIwqfAWbFxxh5eUkQfpwARch7wLMnthebO9t-bIS5W2YrL_aJILUhQpz0LO32IDlKMcz63hmCTYvSybCTqTXGd_2unhvE\
fwRdeWktLRZvkP2lIwiv6dKn43gijVg5bQxA';

export const applicationReference: number = 1234570231;

export const noResults: RegeneratedEmailsRecord[] =
  [
    {
      appRef: null,
      emailRegenerationDetails: null,
    },
  ];

export const normalResultSinglar: RegeneratedEmailsRecord[] =
  [
    {
      appRef: 1234570231,
      emailRegenerationDetails: [
        {
          newEmail: 'new_email@test',
          newLanguage: 'English',
          regeneratedDate: '2023-04-05 11:00:58',
        },
      ],
    },
  ];
