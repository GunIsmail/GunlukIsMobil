import { http } from './http';
import type { ChatMessage } from '@/types/models';

export const chatApi = {
  async history(applicationId: string): Promise<ChatMessage[]> {
    const { data } = await http.get<ChatMessage[]>(`/api/chat/history/${applicationId}`);
    return data;
  },
};
