// app/support/chat/[conversationId]/page.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft,
  Paperclip,
  X,
  File,
  Image as ImageIcon,
  UserRoundCog
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import ReactMarkdown from 'react-markdown';
import { getConversationMessages } from '@/services/apiService';
import { toast } from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

export default function SupportChatPage() {
  const params = useParams();
  const router = useRouter();
  const { sessionId } = params;
  const { 
    socket, 
    sendMessage,
    sendTypingIndicator,
    userTypingSessions,
    ackSessions
  } = useAppContext();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationData, setConversationData] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [clientAcknowledged, setClientAcknowledged] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsUserTyping(userTypingSessions.has(sessionId));
  }, [userTypingSessions, sessionId]);

  // Load session data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        const response = await getConversationMessages(sessionId);
        setConversationData(response.session);
        setMessages(response.messages || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    if (sessionId) {
      loadConversation();
    }
  }, [sessionId]);


  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('join_conversation', sessionId);
    }
  
    return () => {
      if (socket && sessionId) {
        socket.emit('leave_conversation', sessionId);
      }
    };
  }, [socket, sessionId])

  // Check if the client was acknowledged by the human agent
  useEffect(() => {
    if (!ackSessions.has(sessionId)) return;

    const shown = JSON.parse(localStorage.getItem("shownAck") || "[]");

    // If the session was already shown, return
    if (shown.includes(sessionId)) return;
    
    // Show the acknowledged notification
    setClientAcknowledged(true);

    // Save that the session was shown
    const updated = [...shown, sessionId];
    localStorage.setItem("shownAck", JSON.stringify(updated));

}, [ackSessions, sessionId])
  

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages in this conversation
    const handleNewMessage = (data) => {
      if (data.sessionId === sessionId) {
        setIsUserTyping(false);
        setMessages((prev) => [...prev, data.message]);
        //setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
     
    };
  }, [socket, sessionId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;

    setClientAcknowledged(false);

    const messageContent = inputMessage;
    const messageAttachments = [...attachments];

    setInputMessage('');
    setAttachments([]);
    sendTypingIndicator(sessionId, false);

    const newMessage = {
      role: 'humanAgent',
      content: messageContent,
      createdAt: new Date(),
      attachments: messageAttachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    };

    //setMessages((prev) => [...prev, { ...newMessage, _id: Date.now() }]);
    
    // Send via helper function
    sendMessage(sessionId, newMessage)
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    // Send typing indicator
    sendTypingIndicator(sessionId, true);
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(sessionId, false);
    }, 2000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    router.push('/conversations/inbox');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <RefreshCw className="h-5 w-5 animate-spin text-brand-500" />
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Loading conversation history...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb 
        pageTitle={`Support Chat`} 
        breadcrumbItems={[
          { label: 'Conversations Support', href: '/conversations/support' },
          { label: conversationData?.visitorId || 'Chat', href: '#' }
        ]}
      />

      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]">
        <ComponentCard className="flex flex-col flex-1 overflow-y-auto w-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {conversationData?.visitorId || 'User'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {conversationData?.visitorId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                size="sm" 
                color={conversationData?.status === 'active' ? 'success' : 'warning'}
              >
                {conversationData?.status || 'Active'}
              </Badge>
              {conversationData?.sentiment && (
                <Badge 
                  size="sm" 
                  color={
                    conversationData.sentiment === 'positive' ? 'success' :
                    conversationData.sentiment === 'negative' ? 'error' : 'warning'
                  }
                >
                  {conversationData.sentiment}
                </Badge>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex gap-3 ${
                  message.role === 'humanAgent' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role !== 'humanAgent' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                )}

                <div className={`max-w-2xl ${message.role === 'humanAgent' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'humanAgent'
                        ? 'bg-brand-500 text-white'
                        : message.role === 'assistant'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1 className="text-lg font-bold my-2" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-base font-semibold my-2" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-sm font-medium my-1" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="my-1" {...props} />
                            )
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white/10"
                          >
                            {attachment.type.startsWith('image/') ? (
                              <ImageIcon className="h-3 w-3" />
                            ) : (
                              <File className="h-3 w-3" />
                            )}
                            <span className="truncate">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                      message.role === 'humanAgent' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.role === 'humanAgent' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-500 flex items-center justify-center order-2">
                    <UserRoundCog className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Client Acknowledgment Notification */}
            {clientAcknowledged && (
              <div className="flex justify-center px-4 py-2">
                <div className="max-w-md w-full bg-gradient-to-r from-success-400 via-success-500 to-emerald-500 rounded-2xl px-5 py-3.5 shadow-lg border border-success-300/20">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        Client Notified
                      </p>
                      <p className="text-xs text-white/95 mt-0.5">
                        The visitor knows you've joined
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isUserTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="max-w-2xl">
                  <div className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <File className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="text-gray-900 dark:text-white truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="flex-1">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="min-h-[3rem]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() && attachments.length === 0}
                className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}