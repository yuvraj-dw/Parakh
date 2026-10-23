import { apiClient } from './client';
import { ChatMessageOut, ChatPersona, ChatRequest, ChatResponse, ConversationOut } from '../types/api';

export const chatApi = {
  sendMessage: async (
    message: string,
    conversationId?: string,
    persona: ChatPersona = 'CONSUMER'
  ): Promise<ChatResponse> => {
    const payload: ChatRequest = {
      message,
      conversation_id: conversationId || undefined,
      persona,
    };
    return apiClient.post<ChatResponse>('/chat', payload);
  },

  listConversations: async (): Promise<ConversationOut[]> => {
    return apiClient.get<ConversationOut[]>('/chat/conversations');
  },

  getConversationMessages: async (conversationId: string): Promise<ChatMessageOut[]> => {
    return apiClient.get<ChatMessageOut[]>(`/chat/conversations/${conversationId}/messages`);
  },
};
