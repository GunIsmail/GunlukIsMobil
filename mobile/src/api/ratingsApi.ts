import { http } from './http';
import type { EmployerRatingSummary, WorkerRatingSummary } from '@/types/models';

export const ratingsApi = {
  async rateWorker(payload: {
    applicationId: string;
    communication: number;
    serviceSpeed: number;
    teamwork: number;
    comment?: string;
  }): Promise<void> {
    await http.post('/api/ratings/worker', payload);
  },

  async rateEmployer(payload: {
    applicationId: string;
    workingConditions: number;
    paymentReliability: number;
    managementStyle: number;
    comment?: string;
  }): Promise<void> {
    await http.post('/api/ratings/employer', payload);
  },

  async getWorkerSummary(workerId: string): Promise<WorkerRatingSummary> {
    const { data } = await http.get<WorkerRatingSummary>(`/api/ratings/worker/${workerId}`);
    return data;
  },

  async getEmployerSummary(employerId: string): Promise<EmployerRatingSummary> {
    const { data } = await http.get<EmployerRatingSummary>(`/api/ratings/employer/${employerId}`);
    return data;
  },
};
