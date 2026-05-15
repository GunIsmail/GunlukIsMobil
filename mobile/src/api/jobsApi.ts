import { http } from './http';
import type { JobAdvertisement } from '@/types/models';

export interface JobFilter {
  district?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  providesFood?: boolean;
  providesTransport?: boolean;
}

export const jobsApi = {
  async list(filter: JobFilter = {}): Promise<JobAdvertisement[]> {
    const { data } = await http.get<JobAdvertisement[]>('/api/jobs', { params: filter });
    return data;
  },
  async getById(id: string): Promise<JobAdvertisement> {
    const { data } = await http.get<JobAdvertisement>(`/api/jobs/${id}`);
    return data;
  },
  async districts(): Promise<string[]> {
    const { data } = await http.get<string[]>('/api/jobs/districts');
    return data;
  },
  async listMine(): Promise<JobAdvertisement[]> {
    const { data } = await http.get<JobAdvertisement[]>('/api/jobs/mine');
    return data;
  },
  async create(payload: {
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
  }): Promise<JobAdvertisement> {
    const { data } = await http.post<JobAdvertisement>('/api/jobs', payload);
    return data;
  },
};
