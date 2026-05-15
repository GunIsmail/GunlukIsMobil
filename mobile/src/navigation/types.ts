export type RootStackParamList = {
  AppRoot: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: undefined;
  JobDetail: { jobId: string };
  CreateJob: undefined;
  Applicants: { jobId: string; title: string };
  Chat: { applicationId: string; jobTitle: string };
};
