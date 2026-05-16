export type UserRole = 'Worker' | 'Employer';

export interface ProfileInfo {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}
export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface JobAdvertisement {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  district: string;
  address: string;
  jobDate: string;
  startTime: string;
  endTime: string;
  price: number;
  providesFood: boolean;
  providesTransport: boolean;
  quota: number;
  isActive: boolean;
  createdAt: string;
}

export interface EmployerRatingDetail {
  workingConditions: number;
  paymentReliability: number;
  managementStyle: number;
  comment?: string;
}

export interface JobApplication {
  id: string;
  jobAdvertisementId: string;
  jobTitle: string;
  jobDate: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
  hasRatedEmployer?: boolean;
  employerRatingDetail?: EmployerRatingDetail;
}

export interface ChatMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface WorkerRatingSummary {
  workerId: string;
  workerName: string;
  totalRatings: number;
  overallAverage: number;
  communicationAvg: number;
  serviceSpeedAvg: number;
  teamworkAvg: number;
}

export interface EmployerRatingSummary {
  employerId: string;
  employerName: string;
  totalRatings: number;
  overallAverage: number;
  workingConditionsAvg: number;
  paymentReliabilityAvg: number;
  managementStyleAvg: number;
}
