export type UserRole = 'Worker' | 'Employer';
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
  isActive: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobAdvertisementId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
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
