import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { config } from '@/config';
import { tokenStorage } from './tokenStorage';
import type { ChatMessage } from '@/types/models';

export interface ChatHubClient {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  join: (applicationId: string) => Promise<void>;
  leave: (applicationId: string) => Promise<void>;
  send: (applicationId: string, content: string) => Promise<void>;
  onMessage: (handler: (message: ChatMessage) => void) => void;
}

export const createChatHub = (): ChatHubClient => {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(config.hubUrl, {
      accessTokenFactory: async () => (await tokenStorage.getAccessToken()) ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  return {
    start: async () => {
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      }
    },
    stop: async () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop();
      }
    },
    join: (applicationId) => connection.invoke('JoinConversation', applicationId),
    leave: (applicationId) => connection.invoke('LeaveConversation', applicationId),
    send: (applicationId, content) =>
      connection.invoke('SendMessage', { applicationId, content }),
    onMessage: (handler) => {
      connection.on('ReceiveMessage', handler);
    },
  };
};
