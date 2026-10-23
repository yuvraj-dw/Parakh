import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  CheckCircle2,
  Layers,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { ChatMessage, ChatPersona, ConversationHistoryItem, NavRoute, SourceCitation, NavigationPayload } from '../types';
import { ApiError } from '../api/client';
import { chatService } from '../services/chatService';
import { SUGGESTED_ASSISTANT_QUESTIONS } from '../data/assistant';
import { SourceEvidenceCard } from '../components/common/SourceEvidenceCard';
import { MarkdownView } from '../components/common/MarkdownView';
import { BisLogo } from '../components/common/BisLogo';

interface AIAssistantPageProps {
  initialPrompt?: string;
  onNavigate: (route: NavRoute, payload?: NavigationPayload) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  initialPrompt,
  onNavigate,
}) => {
  const [conversations, setConversations] = useState<ConversationHistoryItem[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState<boolean>(true);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [persona, setPersona] = useState<ChatPersona>('CONSUMER');
  const personaRef = useRef<ChatPersona>(persona);

  useEffect(() => {
    personaRef.current = persona;
  }, [persona]);

  const [showHistorySidebar, setShowHistorySidebar] = useState<boolean>(true);
  const [chatError, setChatError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: `### Namaste! I am the BIS Parakh AI Assistant

I can answer any questions regarding **Indian Standards (IS)**, mandatory **Quality Control Orders (QCOs)**, **BIS certification procedures**, testing laboratories, or **gold hallmarking (HUID)**.

Select one of the suggested questions below or enter your inquiry to begin:`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedCitation, setSelectedCitation] = useState<SourceCitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedPromptRef = useRef<string | null>(null);

  const loadConversations = async () => {
    setIsLoadingConvs(true);
    try {
      const convList = await chatService.getConversations();
      setConversations(convList);
    } catch (err) {
      console.warn('Could not load chat conversations from backend:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle incoming initial prompt from Homepage Hero chat
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && processedPromptRef.current !== initialPrompt) {
      processedPromptRef.current = initialPrompt;
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSelectConversation = async (convId: string) => {
    setActiveConvId(convId);
    setChatError(null);
    setIsTyping(true);
    try {
      const convMsgs = await chatService.getConversationMessages(convId);
      if (convMsgs.length > 0) {
        setMessages(convMsgs);
        const lastMsgWithCitations = [...convMsgs].reverse().find(m => m.citations && m.citations.length > 0);
        if (lastMsgWithCitations && lastMsgWithCitations.citations) {
          setSelectedCitation(lastMsgWithCitations.citations[0]);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to load conversation history from backend.';
      setChatError(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const currentPersona = personaRef.current;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: currentPersona,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);
    setChatError(null);

    try {
      const aiResponse = await chatService.sendMessage(query, activeConvId, currentPersona);

      setMessages((prev) => [...prev, aiResponse]);
      if (aiResponse.citations && aiResponse.citations.length > 0) {
        setSelectedCitation(aiResponse.citations[0]);
      }
      if (aiResponse.conversation_id) {
        setActiveConvId(aiResponse.conversation_id);
        loadConversations();
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'The Parakh AI Assistant service could not be reached. Please check the backend connection and try again.';
      setChatError(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(undefined);
    setChatError(null);
    setSelectedCitation(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'New session started. What product, standard, or regulatory query can I help you explore?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: personaRef.current,
      },
    ]);
  };

  const handleClearConversation = () => {
    setActiveConvId(undefined);
    setChatError(null);
    setSelectedCitation(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation cleared. How can I assist you with Indian Standards today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: personaRef.current,
      },
    ]);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <button
            onClick={() => onNavigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3A74C2', fontWeight: 600, cursor: 'pointer' }}
          >
            <ChevronLeft size={16} /> Home
          </button>
          <span>/</span>
          <span style={{ color: '#1D2B42', fontWeight: 700 }}>AI Assistant</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Persona Toggle */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
            }}
          >
            <button
              type="button"
              id="persona-consumer-btn"
              onClick={() => setPersona('CONSUMER')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: persona === 'CONSUMER' ? '#FFFFFF' : 'transparent',
                color: persona === 'CONSUMER' ? '#1E40AF' : '#64748B',
                boxShadow: persona === 'CONSUMER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              Consumer
            </button>
            <button
              type="button"
              id="persona-industry-btn"
              onClick={() => setPersona('INDUSTRY')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: persona === 'INDUSTRY' ? '#FFFFFF' : 'transparent',
                color: persona === 'INDUSTRY' ? '#1E40AF' : '#64748B',
                boxShadow: persona === 'INDUSTRY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              Industry
            </button>
          </div>

          <button
            onClick={handleStartNewChat}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: '8px', padding: '6px 12px' }}
          >
            <Plus size={14} /> New Conversation
          </button>
          <button
            onClick={handleClearConversation}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '8px', padding: '6px 12px' }}
            title="Clear Chat Messages"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
          <button
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '8px', padding: '6px 12px' }}
          >
            <MessageSquare size={14} /> {showHistorySidebar ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D6E4F8',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(30, 41, 59, 0.05)',
        }}
      >
        {/* Left History Sidebar (Per Section 14) */}
        {showHistorySidebar && (
          <aside
            style={{
              width: '260px',
              backgroundColor: '#F8FAFD',
              borderRight: '1px solid #E2EAF5',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2EAF5', fontSize: '12px', fontWeight: 800, color: '#39527B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Conversations History
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isLoadingConvs ? (
                <div style={{ padding: '16px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
                  Loading sessions...
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '16px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
                  No saved sessions. Start a query below.
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: activeConvId === c.id ? '#FFFFFF' : 'transparent',
                      border: activeConvId === c.id ? '1px solid #D6E4F8' : '1px solid transparent',
                      cursor: 'pointer',
                      boxShadow: activeConvId === c.id ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: activeConvId === c.id ? 800 : 600, color: activeConvId === c.id ? '#3A74C2' : '#1D2B42', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.preview}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Right Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: '#FFFFFF' }}>
          {/* Messages Scrollable Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: isUser ? '75%' : '88%',
                      padding: isUser ? '12px 18px' : '18px 22px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? '#39527B' : '#F8FAFD',
                      color: isUser ? '#FFFFFF' : '#1E293B',
                      border: isUser ? 'none' : '1px solid #E2EAF5',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    {!isUser && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BisLogo size={18} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#3A74C2' }}>
                            BIS Parakh AI Assistant
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          title="Copy response"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedId === msg.id ? '#166534' : '#94A3B8',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}

                    <div style={{ fontSize: '13.5px', lineHeight: 1.6 }}>
                      <MarkdownView content={msg.text} />
                    </div>

                    {/* Citations Box if present */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid #E2EAF5', paddingTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Authoritative Source Citation
                        </div>
                        {msg.citations.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '8px',
                              border: '1px solid #D6E4F8',
                              fontSize: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <strong>{c.documentTitle}</strong> — {c.clause || c.isNumber}
                              {c.page && <span style={{ marginLeft: '4px', color: '#64748B' }}>(Page {c.page})</span>}
                              {c.sourceName && <div style={{ fontSize: '11px', color: '#64748B' }}>{c.sourceName}</div>}
                              {c.sourceUrl && (
                                <div style={{ marginTop: '2px' }}>
                                  <a
                                    href={c.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '11px', color: '#3A74C2', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    View Source Document <ExternalLink size={10} />
                                  </a>
                                </div>
                              )}
                            </div>
                            {c.confidence != null && (
                              <span className="badge badge-sky" style={{ fontSize: '10px' }}>
                                {Math.round(c.confidence * 100)}% Confidence
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons if present */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                        {msg.actions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => onNavigate(act.route, act.payload)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid #3A74C2',
                              color: '#3A74C2',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {act.label} &rarr;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '4px', padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Error banner if backend chat call failed */}
            {chatError && (
              <div
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span>{chatError}</span>
                <button
                  onClick={() => handleSendMessage()}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading typing bubble */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', backgroundColor: '#F8FAFD', borderRadius: '12px', width: 'fit-content' }}>
                <BisLogo size={16} />
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                  Analyzing Indian Standards & QCO repository...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Row (Per Section 14) */}
          <div
            style={{
              padding: '10px 24px 6px',
              borderTop: '1px solid #EDF3FB',
              backgroundColor: '#FAFCFF',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {SUGGESTED_ASSISTANT_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D6E4F8',
                  color: '#39527B',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#EAF2FE';
                  e.currentTarget.style.borderColor = '#3A74C2';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#D6E4F8';
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box Bar */}
          <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #E2EAF5', backgroundColor: '#FFFFFF' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
            >
              <input
                type="text"
                placeholder="Ask about Indian Standards, mandatory QCOs, HUID verification, or testing labs..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 16px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: '1.5px solid #D0E2FB',
                  backgroundColor: '#F8FAFD',
                  color: '#1D2B42',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
