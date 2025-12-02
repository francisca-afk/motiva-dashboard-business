"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, MessageSquare, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import DataTable from '@/components/tables/DataTable';
import { useAppContext } from '@/context/AppContext';
import useConversations from '@/hooks/useConversations';
import ConversationRow from '@/components/conversations/ConversationRow';
import { getConversationSummary, getConversationMessages, emailConversationSummary, takeOverSession, generateConversationSummary } from '@/services/apiService';
import SummaryModal from '@/components/modals/SummaryModal';
import ConversationHistoryModal from '@/components/modals/ConversationHistoryModal';
import { toast } from 'react-hot-toast';
import usePagination from '@/hooks/usePagination';

export default function ConversationsPage() {
  const { business } = useAppContext();
  const { 
    sessions, 
    loading: initialLoading, 
    isRefreshing: autoRefreshing,
    refreshConversations, 
    deleteSession 
  } = useConversations(business?._id);
  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sessions, 10)
  const [generatingSummary, setGeneratingSummary] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, summary: null, title: '' });
  const [historyModal, setHistoryModal] = useState({ 
    isOpen: false, 
    messages: [], 
    title: '' 
  });
  const router = useRouter();
  
  /**
  useEffect(() => {
    if (sessions && Array.isArray(sessions)) {
      console.log('sessions', sessions);
      setIsLoading(false);
    }
  }, [sessions]);
  */

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshConversations();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  /**
   * Navigate to conversation details
   */
  const handleViewDetails = async (sessionId) => {
    try {
        const session = sessions.find(s => s._id === sessionId);
        if (!session) return;

        const response = await getConversationMessages(sessionId);
        setHistoryModal({
        isOpen: true,
        messages: response.messages || [],
        title: session.title
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        alert('Failed to load conversation history. Please try again.');
    }
 };

 /**
 * Send conversation via email
 */
const handleSendEmail = async (sessionId, type) => {
    try {
      const emailData = { type }; // 'history' or 'summary'
      await emailConversationSummary(sessionId, emailData);
      console.log(`✅ ${type} sent via email`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleViewSummary = async (sessionId) => {
    try {
      const session = sessions.find(s => s._id === sessionId);
      if (!session) return;
  
      const response = await getConversationSummary(sessionId);
      console.log('response DATA SUMMARY', response);
      console.log('Summary fetched for session:', response);
      setSummaryModal({
        isOpen: true,
        summary: response.data.messages,
        title: session.title
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      alert('Failed to load summary. Please try again.');
    }
  }

  /**
   * Generate conversation summary
   */
  const handleGenerateSummary = async (sessionId) => {
    try {
      setGeneratingSummary(sessionId);
      const response = await getConversationSummary(sessionId);
      if (!response) {
        const summaryResponse = await generateConversationSummary(sessionId);
        console.log('Summary generated for session:', summaryResponse);
      }
      // Refresh to update the summary status
      await refreshConversations();
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(null);
    }
  };

  /**
   * Handle intervention (placeholder for future implementation)
   */
  const handleIntervene = async (sessionId) => {
    try {
      const response = await takeOverSession(sessionId);
      console.log('Session taken over:', response);
      router.push(`/conversations/support/${sessionId}`);
    } catch (error) {
      console.error('Error taking over session:');
      toast.error('Failed to take over session. Please try again.');
    }
  };

  /**
   * Calculate overview metrics
   */
  const calculateOverviewMetrics = () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const activeSessions = sessions.filter(s => 
      s.status === 'active'
      // && 
      // new Date(s.metrics.lastActivity).getTime() > fiveMinutesAgo
    );

    const totalMessages = sessions.reduce((sum, s) => sum + s.metrics.totalMessages, 0);
    
    const sessionsWithNegativeMood = sessions.filter(s => 
      s.metrics.currentMood === 'negative' || 
      s.metrics.currentMood === 'frustrated' ||
      s.metrics.negativeCount > s.metrics.positiveCount
    );

    const totalNotifications = sessions.reduce((sum, s) => sum + s.metrics.notificationsSent, 0);

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalMessages,
      alertSessions: sessionsWithNegativeMood.length,
      totalNotifications
    };
  };

  /**
   * Get row className based on alert level
   */
  const getRowClassName = (session) => {
    const metrics = session.metrics;
    const negativeRatio = metrics.totalMessages > 0 
      ? metrics.negativeCount / metrics.totalMessages 
      : 0;
    
    if (negativeRatio > 0.5 || metrics.currentMood === 'frustrated') {
      return 'border-l-4 border-l-error-500 bg-error-50/30 dark:bg-error-500/5';
    }
    
    if (metrics.moodChanges > 3 || negativeRatio > 0.3) {
      return 'border-l-4 border-l-warning-500 bg-warning-50/30 dark:bg-warning-500/5';
    }
    
    return '';
  };

  const metrics = calculateOverviewMetrics();
  const headers = ['Status', 'Conversation', 'Messages', 'Current Mood', 'Summary', 'Notifications', 'Actions'];

  if (initialLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Conversations" />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
          We are loading the conversations of your business! Please wait a moment...
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Conversations" />
      
      <div className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Sessions */}
          <ComponentCard className="p-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalSessions}
                </p>
              </div>
              <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-500/10">
                <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </ComponentCard>

          {/* Active Sessions */}
          <ComponentCard className="p-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Now
                </p>
                <p className="mt-2 text-3xl font-bold text-success-600 dark:text-success-400">
                  {metrics.activeSessions}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Last 5 minutes
                </p>
              </div>
              <div className="rounded-lg bg-success-50 p-3 dark:bg-success-500/10">
                <div className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-success-500"></span>
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* Total Messages */}
          <ComponentCard className="p-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Messages
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalMessages}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </ComponentCard>

          {/* Alert Sessions */}
          <ComponentCard className="p-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alert Sessions
                </p>
                <p className="mt-2 text-3xl font-bold text-error-600 dark:text-error-400">
                  {metrics.alertSessions}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Negative mood
                </p>
              </div>
              <div className="rounded-lg bg-error-50 p-3 dark:bg-error-500/10">
                <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </ComponentCard>

          {/* Notifications Sent */}
          <ComponentCard className="p-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Notifications
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalNotifications}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alerts sent
                </p>
              </div>
              <div className="rounded-lg bg-warning-50 p-3 dark:bg-warning-500/10">
                <FileText className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Conversations Table */}
        <ComponentCard 
          title="Conversations" 
          action={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        >
            <DataTable
              headers={headers}
              rows={paginatedData}
              rowClassName={getRowClassName}
              loading={false}
              renderRow={(session) => (
                <ConversationRow
                  key={session._id}
                  session={session}
                  metrics={session.metrics}
                  onViewDetails={handleViewDetails}
                  onGenerateSummary={handleGenerateSummary}
                  onIntervene={handleIntervene}
                  onViewSummary={handleViewSummary}
                  onDelete={deleteSession}
                  isGeneratingSummary={generatingSummary === session._id}
                />
              )}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: goToPage
              }}
            />
        </ComponentCard>

        {/* Real-time Update Indicator - Solo si hay sesiones */}
        {sessions.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </div>
            <span>Auto-updating every 10 seconds</span>
          </div>
        )}
      </div>
        {/* History Modal */}
        <ConversationHistoryModal
            isOpen={historyModal.isOpen}
            onClose={() => setHistoryModal({ isOpen: false, messages: [], title: '' })}
            messages={historyModal.messages}
            sessionTitle={historyModal.title}
            onSendEmail={(type) => {
                const session = sessions.find(s => s.title === historyModal.title);
                if (session) handleSendEmail(session._id, type);
            }}
        />
      {/* Summary Modal */}
        <SummaryModal
            isOpen={summaryModal.isOpen}
            onClose={() => setSummaryModal({ isOpen: false, summary: null, title: '' })}
            summary={summaryModal.summary}
            sessionTitle={summaryModal.title}
        />        
    </div>
  );
}