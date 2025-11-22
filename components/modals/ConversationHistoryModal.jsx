"use client";
import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { MessageSquare, User, Bot, Mail, Filter, Calendar, UserRoundCog } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

export default function ConversationHistoryModal({ 
  isOpen, 
  onClose, 
  messages, 
  sessionTitle,
  onSendEmail 
}) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [sendType, setSendType] = useState(null);

  const roleOptions = [
    { value: 'all', label: 'All Messages', icon: MessageSquare },
    { value: 'user', label: 'User Only', icon: User },
    { value: 'assistant', label: 'Assistant Only', icon: Bot },
    { value:'humanAgent', label: 'Human Agent Only', icon: UserRoundCog}
  ];

  const filteredMessages = useMemo(() => {
    if (roleFilter === 'all') return messages;
    return messages.filter(msg => msg.role === roleFilter);
  }, [messages, roleFilter]);

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'positive':
      case 'excited':
      case 'calm':
        return 'success';
      case 'negative':
      case 'frustrated':
        return 'error';
      case 'tired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'humanAgent':
        return <UserRoundCog className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendEmail = (type) => {
    setSendType(type);
    onSendEmail(type);
    setTimeout(() => setSendType(null), 2000);
  };

  if (!messages || messages.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-brand-50 p-2.5 dark:bg-brand-500/10 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Conversation History
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-12 truncate">
                {sessionTitle}
              </p>
            </div>

            {/* Email Actions */}
            <div className="flex gap-2 flex-shrink-0 pr-15">
              <button
                onClick={() => handleSendEmail('history')}
                disabled={sendType === 'history'}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{sendType === 'history' ? 'Sent!' : 'Send History'}</span>
              </button>
              <button
                onClick={() => handleSendEmail('summary')}
                disabled={sendType === 'summary'}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10 transition-colors disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{sendType === 'summary' ? 'Sent!' : 'Send Summary'}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {roleOptions.map(option => {
                const Icon = option.icon;
                const isActive = roleFilter === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setRoleFilter(option.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0">
              {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMessages.map((message, index) => (
            <div key={message._id || index} className="space-y-2">
              {/* Message Header */}
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 rounded-lg p-1.5 ${
                  message.role === 'user'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                }`}>
                  {getRoleIcon(message.role)}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {message.role}
                </span>
                {message.role !== 'humanAgent' && message.role !== 'assistant' && message.mood && message.mood !== 'none' && (
                  <Badge size="sm" color={getMoodColor(message.mood)}>
                    {message.mood}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-auto">
                  <Calendar className="h-3 w-3" />
                  {formatTimestamp(message.createdAt)}
                </span>
              </div>
              
              {/* Message Content */}
              <div className={`rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/20'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {/* Metadata */}
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {Object.entries(message.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      <span className="font-semibold">{key}:</span>
                      <span>{String(value)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total: {messages.length} messages
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-brand-400 px-6 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}