import { useState, useCallback, useEffect, useRef } from 'react';
import { getBusinessConversations, getConversationMessages, getMoodCountBySessionId, getConversationSummary } from '@/services/apiService';

export default function useConversations(businessId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true); // Cambiado a true para carga inicial
  const [isRefreshing, setIsRefreshing] = useState(false); // Nuevo estado para updates
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isFirstLoadRef = useRef(true); // Para trackear primera carga

  /**
   * Fetch all conversations with metrics
   */
  const fetchConversations = useCallback(async (silent = false) => {
    if (!businessId) return;

    try {
      if (isFirstLoadRef.current) {
        setLoading(true);
      } else if (!silent) {
        setIsRefreshing(true);
      }
      
      setError(null);

      const response = await getBusinessConversations(businessId);
      const sessionsData = response.data?.sessions || [];

      // Calculate metrics
      const sessionsWithMetrics = await Promise.all(
        sessionsData.map(async (session) => {
          try {
            // Get messages for counting and other metrics
            const messagesResponse = await getConversationMessages(session._id);
            const messages = messagesResponse.messages || [];

            // Get moods from the endpoint
            const moodData = await getMoodCountBySessionId(session._id);
            
            // Calculate mood changes
            let moodChanges = 0;
            for (let i = 1; i < messages.length; i++) {
              if (messages[i].mood !== messages[i - 1].mood && 
                  messages[i].mood !== 'none' && 
                  messages[i - 1].mood !== 'none') {
                moodChanges++;
              }
            }

            // Count notifications
            const notificationsSent = messages.filter(m => 
              m.actions && m.actions.includes('sendEmailNotification')
            ).length;

            // Check if it has summary
            let hasSummary = false;
            try {
              const summaryResponse = await getConversationSummary(session._id);
              hasSummary = !!summaryResponse?.data?.messages;
            } catch (err) {
              hasSummary = false;
            }

            // Get last activity
            const lastActivity = messages.length > 0 
              ? messages[messages.length - 1].timestamp 
              : session.timestamp;

            return {
              ...session,
              metrics: {
                sessionId: session._id,
                totalMessages: messages.length,
                positiveCount: moodData.data?.moodStats?.positive || 0,
                negativeCount: moodData.data?.moodStats?.negative || 0,
                currentMood: moodData.data?.lastMood || 'none',
                moodChanges,
                notificationsSent,
                hasSummary,
                lastActivity
              }
            };
          } catch (err) {
            console.error(`Error calculating metrics for session ${session._id}:`, err);
            return {
              ...session,
              metrics: {
                sessionId: session._id,
                totalMessages: 0,
                positiveCount: 0,
                negativeCount: 0,
                currentMood: 'none',
                moodChanges: 0,
                notificationsSent: 0,
                hasSummary: false,
                lastActivity: session.timestamp
              }
            };
          }
        })
      );

      setSessions(sessionsWithMetrics);
      
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [businessId]);

  /**
   * Start polling for updates
   */
  /**
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll cada 10 segundos de forma silenciosa
    intervalRef.current = setInterval(() => {
      fetchConversations(true); // silent = true
    }, 10000);
  }, [fetchConversations]);
  */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  
    intervalRef.current = setInterval(() => {
      fetchConversations(true);
    }, 10000);
  }, [])

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial fetch and start polling
  /**
  useEffect(() => {
    fetchConversations();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [fetchConversations, startPolling, stopPolling]);
  */

  useEffect(() => {
  if (!businessId) return;

  fetchConversations();

  const interval = setInterval(() => {
    fetchConversations(true);
  }, 10000);

  return () => clearInterval(interval);
}, [businessId, fetchConversations]);

  /**
   * Delete a session
   */
  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      throw err;
    }
  }, []);

  return {
    sessions,
    loading, 
    isRefreshing, 
    error,
    refreshConversations: fetchConversations,
    deleteSession: handleDeleteSession
  };
}