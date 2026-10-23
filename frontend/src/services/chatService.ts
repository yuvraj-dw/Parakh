import { ChatMessage, ChatPersona, ConversationHistoryItem } from '../types';
import { chatApi } from '../api/chat';
import { ChatCitation } from '../types/api';

export const chatService = {
  sendMessage: async (
    query: string,
    conversationId?: string,
    persona?: ChatPersona
  ): Promise<ChatMessage & { conversation_id?: string }> => {
    const res = await chatApi.sendMessage(query, conversationId, persona);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: res.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversation_id: res.conversation_id,
      persona,
      citations: (res.citations || []).map((c: ChatCitation, i: number) => ({
        id: `cit-${i}`,
        documentTitle: c.document_title || 'Indian Standard',
        isNumber: c.standard_number || undefined,
        clause: c.clause || undefined,
        page: c.page !== undefined && c.page !== null ? String(c.page) : undefined,
        sourceUrl: c.source_url || undefined,
      })),
    };
  },

  getConversations: async (): Promise<ConversationHistoryItem[]> => {
    const convs = await chatApi.listConversations();
    return convs.map((c) => ({
      id: c.id,
      title: c.title || 'Inquiry Session',
      preview: 'Recorded session in backend database',
      timestamp: c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'Recent',
      messageCount: 2,
    }));
  },

  getConversationMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const msgs = await chatApi.getConversationMessages(conversationId);
    return msgs.map((m) => ({
      id: m.id,
      sender: m.role,
      text: m.content,
      timestamp: m.created_at
        ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent',
      citations: (m.citations || []).map((c: ChatCitation, i: number) => ({
        id: `cit-${i}`,
        documentTitle: c.document_title || 'Indian Standard',
        isNumber: c.standard_number || undefined,
        clause: c.clause || undefined,
        page: c.page !== undefined && c.page !== null ? String(c.page) : undefined,
        sourceUrl: c.source_url || undefined,
      })),
    }));
  },
};
