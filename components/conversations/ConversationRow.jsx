import React, { useState } from 'react';
import { MessageSquare, FileText, Bell, BellOff, ExternalLink, Trash, Eye } from 'lucide-react';
import SessionStatusBadge from './SessionStatusBadge';
import MoodIndicator from './MoodIndicator';
import Badge from '@/components/ui/badge/Badge';

/**
 * ConversationRow Component
 * Displays a single conversation with metrics, alerts, and actions
 * Returns table cells (td elements) - the parent DataTable provides the tr wrapper
 */
export default function ConversationRow({ 
  session, 
  metrics,
  onViewDetails,
  onGenerateSummary,
  onIntervene,
  onViewSummary,
  onDelete,
  isGeneratingSummary = false
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine alert level based on metrics
  const getAlertLevel = () => {
    const negativeRatio = metrics.totalMessages > 0 
      ? metrics.negativeCount / metrics.totalMessages 
      : 0;
    
    if (negativeRatio > 0.5 || metrics.currentMood === 'frustrated') {
      return 'error'; // Red border
    }
    
    if (metrics.moodChanges > 3 || negativeRatio > 0.3) {
      return 'warning'; // Yellow border
    }
    
    return 'normal';
  };

  const alertLevel = getAlertLevel();

  const getBorderClass = () => {
    switch (alertLevel) {
      case 'error':
        return 'border-l-4 border-l-error-500 bg-error-50/30 dark:bg-error-500/5';
      case 'warning':
        return 'border-l-4 border-l-warning-500 bg-warning-50/30 dark:bg-warning-500/5';
      default:
        return '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(session._id);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = session.status === 'active' ;
  //&& 
  //new Date(metrics.lastActivity).getTime() > (Date.now() - 5 * 60 * 1000);

  return (
    <>
      {/* Status */}
      <td className="px-5 py-4 w-32">
        <SessionStatusBadge 
          status={session.status} 
          lastActivity={metrics.lastActivity} 
        />
      </td>

      {/* Conversation Title */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onViewDetails(session._id)}
            className="text-left font-medium text-gray-800 hover:text-brand-600 dark:text-white/90 dark:hover:text-brand-400 transition-colors"
          >
            {session.title}
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span> {formatDate(session.lastMessageAt || session.createdAt)}</span>
          </div>
        </div>
      </td>

      {/* Messages Count */}
      <td className="px-5 py-4 w-24 text-center">
        <div className="flex items-center justify-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {metrics.totalMessages}
          </span>
        </div>
      </td>

      {/* Current Mood */}
      <td className="px-5 py-4 w-48">
        <MoodIndicator
          currentMood={metrics.currentMood}
          negativeCount={metrics.negativeCount}
          positiveCount={metrics.positiveCount}
          moodChanges={metrics.moodChanges}
        />
      </td>

      {/* Summary Status */}
      <td className="px-5 py-4 w-32 text-center">
        {metrics.hasSummary ? (
          <button
            onClick={() => onViewSummary(session._id)}
            className="inline-flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <Badge size="sm" color="success">
              <FileText className="h-3 w-3 mr-1" />
              Generated <Eye className="h-3 w-3 ml-1" />
            </Badge>
          </button>
        ) : (
          <Badge size="sm" color="default">
            Pending
          </Badge>
        )}
      </td>

      {/* Notifications */}
      <td className="px-5 py-4 w-32 text-center">
        <div className="flex items-center justify-center gap-2">
          {metrics.notificationsSent > 0 ? (
            <>
              <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {metrics.notificationsSent}
              </span>
            </>
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(session._id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            title="View details"
          >
            <ExternalLink className="h-4 w-4" />
            View
          </button>

          {/* Generate Summary */}
          {!metrics.hasSummary && (
            <button
              onClick={() => onGenerateSummary(session._id)}
              disabled={isGeneratingSummary}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate summary"
            >
              <FileText className="h-4 w-4" />
              Summary
            </button>
          )}

          {/* Intervene (only for active sessions) */}
          {isActive && (
            <button
              onClick={() => onIntervene(session._id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10 transition-colors"
              title="Join conversation"
            >
              <MessageSquare className="h-4 w-4" />
              Intervene
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete conversation"
          >
            <Trash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </td>
    </>
  );
}