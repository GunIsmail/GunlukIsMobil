import { http } from './http';
import type { JobApplication } from '@/types/models';

export const applicationsApi = {
  async apply(jobAdvertisementId: string, message?: string): Promise<JobApplication> {
    const { data } = await http.post<JobApplication>('/api/applications', {
      jobAdvertisementId,
      message,
    });
    return data;
  },
  async listMine(): Promise<JobApplication[]> {
    const { data } = await http.get<JobApplication[]>('/api/applications/mine');
    return data;
  },
  async listConversations(): Promise<JobApplication[]> {
    const { data } = await http.get<JobApplication[]>('/api/applications/conversations');
    return data;
  },
  async listByJob(jobId: string): Promise<JobApplication[]> {
    const { data } = await http.get<JobApplication[]>(`/api/applications/by-job/${jobId}`);
    return data;
  },
  async accept(id: string): Promise<JobApplication> {
    const { data } = await http.post<JobApplication>(`/api/applications/${id}/accept`);
    return data;
  },
  async reject(id: string): Promise<JobApplication> {
    const { data } = await http.post<JobApplication>(`/api/applications/${id}/reject`);
    return data;
  },
};
