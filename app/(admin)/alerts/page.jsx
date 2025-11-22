// app/alerts/page.jsx
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  RefreshCw,
  Eye,
  Trash,
  AlertTriangle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import DataTable from '@/components/tables/DataTable';
import Badge from '@/components/ui/badge/Badge';
import { useAppContext } from '@/context/AppContext';
import ConversationHistoryModal from '@/components/modals/ConversationHistoryModal';
import { getConversationMessages, emailConversationSummary, markAlertAsRead, markAlertAsResolved, deleteAlert } from '@/services/apiService';


export default function AlertsPage() {
  const router = useRouter();
  const { alerts = [], setAlerts } = useAppContext();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [historyModal, setHistoryModal] = useState({ 
    isOpen: false, 
    messages: [], 
    title: '' 
  });
  useEffect(() => {
    if (alerts && Array.isArray(alerts)) {
      setIsLoading(false);
    }
  }, [alerts]);

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All', count: alerts.length },
    { value: 'unread', label: 'Unread', count: alerts.filter(a => a.status === 'unread').length },
    { value: 'read', label: 'Read', count: alerts.filter(a => a.status === 'read').length },
    { value: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'lowMood', label: 'Low Mood' },
    { value: 'unresolvedIssue', label: 'Unresolved' },
    { value: 'escalationRequest', label: 'Escalation' },
    { value: 'systemError', label: 'System Error' }
  ];

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [alerts, statusFilter, typeFilter]);

  // Get alert type config
  const getAlertTypeConfig = (type) => {
    switch (type) {
      case 'lowMood':
        return {
          icon: AlertCircle,
          color: 'error',
          bgColor: 'bg-error-50 dark:bg-error-500/10',
          textColor: 'text-error-600 dark:text-error-400',
          label: '😟 Low Mood'
        };
      case 'unresolvedIssue':
        return {
          icon: AlertTriangle,
          color: 'warning',
          bgColor: 'bg-warning-50 dark:bg-warning-500/10',
          textColor: 'text-warning-600 dark:text-warning-400',
          label: '⚠️ Unresolved Issue'
        };
      case 'escalationRequest':
        return {
          icon: Bell,
          color: 'error',
          bgColor: 'bg-purple-50 dark:bg-purple-500/10',
          textColor: 'text-purple-600 dark:text-purple-400',
          label: '🚨 Escalation'
        };
      case 'systemError':
        return {
          icon: XCircle,
          color: 'default',
          bgColor: 'bg-gray-50 dark:bg-gray-500/10',
          textColor: 'text-gray-600 dark:text-gray-400',
          label: '⚙️ System Error'
        };
      default:
        return {
          icon: Bell,
          color: 'default',
          bgColor: 'bg-gray-50 dark:bg-gray-500/10',
          textColor: 'text-gray-600 dark:text-gray-400',
          label: 'Alert'
        };
    }
  };

  // Mark as read
  const handleMarkAsRead = async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => prev.map(a => 
        a._id === alertId ? { ...a, status: 'read' } : a
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Mark as resolved
  const handleMarkAsResolved = async (alertId) => {
    try {
      await markAlertAsResolved(alertId);
      setAlerts(prev => prev.map(a => 
        a._id === alertId ? { ...a, status: 'resolved', resolvedAt: new Date() } : a
      ));
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
    }
  };

  // Delete alert
  const handleDelete = async (alertId) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    
    try {
      await deleteAlert(alertId);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  // View conversation
  const handleViewConversation = async (sessionId, sessionTitle) => {
    try {
      const response = await getConversationMessages(sessionId);
      setHistoryModal({
        isOpen: true,
        messages: response.messages || [],
        title: sessionTitle || 'Conversation'
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Failed to load conversation. Please try again.');
    }
  };

  // Send email
  const handleSendEmail = async (sessionId, type) => {
    try {
      const emailData = { type };
      await emailConversationSummary(sessionId, emailData);
      console.log(`✅ ${type} sent via email`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  // Navigate to conversation
  const handleGoToConversation = (sessionId) => {
    router.push(`/conversations?session=${sessionId}`);
  };

  // Refresh alerts
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Format date
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

  // Row className for unread alerts
  const getRowClassName = (alert) => {
    return alert.status === 'unread' 
      ? 'bg-brand-50/30 dark:bg-brand-500/5 border-l-4 border-l-brand-500' 
      : '';
  };

  const headers = ['Status', 'Alert', 'Type', 'Created', 'Actions'];

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Alerts" />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Alerts" />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusOptions.map(option => {
            const Icon = option.value === 'unread' ? Bell : 
                        option.value === 'resolved' ? CheckCircle : AlertCircle;
            const color = option.value === 'unread' ? 'error' :
                         option.value === 'resolved' ? 'success' : 'default';
            
            return (
              <ComponentCard key={option.value} className="p-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setStatusFilter(option.value)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {option.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {option.count}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    color === 'error' ? 'bg-error-50 dark:bg-error-500/10' :
                    color === 'success' ? 'bg-success-50 dark:bg-success-500/10' :
                    'bg-gray-50 dark:bg-gray-500/10'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      color === 'error' ? 'text-error-600 dark:text-error-400' :
                      color === 'success' ? 'text-success-600 dark:text-success-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                </div>
              </ComponentCard>
            );
          })}
        </div>

        {/* Alerts Table */}
        <ComponentCard 
          title="Alerts & Notifications"
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
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <Filter className="h-4 w-4 text-gray-500" />
            
            {/* Status Filter */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {statusOptions.map(option => {
                const isActive = statusFilter === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {option.label}
                    {option.count > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px]">
                        {option.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-brand-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
            </span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                No alerts found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Alerts will appear here when triggered'}
              </p>
            </div>
          ) : (
            <DataTable
              headers={headers}
              rows={filteredAlerts}
              rowClassName={getRowClassName}
              renderRow={(alert) => {
                const config = getAlertTypeConfig(alert.type);
                const Icon = config.icon;

                return (
                  <>
                    {/* Status Indicator */}
                    <td className="px-5 py-4 w-24">
                      <div className="flex items-center justify-center">
                        {alert.status === 'unread' && (
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-error-500"></span>
                          </div>
                        )}
                        {alert.status === 'read' && (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                        {alert.status === 'resolved' && (
                          <CheckCircle className="h-4 w-4 text-success-500" />
                        )}
                      </div>
                    </td>

                    {/* Alert Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 rounded-lg p-2 ${config.bgColor}`}>
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${alert.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {alert.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4 w-40">
                      <Badge size="sm" color={config.color}>
                        {config.label}
                      </Badge>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-4 w-32">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(alert.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* View Conversation */}
                        {alert.session && (
                          <button
                            onClick={() => handleViewConversation(alert.session._id || alert.session, alert.title)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
                            title="View conversation"
                          >
                            <MessageSquare className="h-4 w-4" />
                            View
                          </button>
                        )}

                        {/* Mark as Read */}
                        {alert.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(alert._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                            Read
                          </button>
                        )}

                        {/* Mark as Resolved */}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => handleMarkAsResolved(alert._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-success-600 hover:bg-success-50 dark:text-success-400 dark:hover:bg-success-500/10 transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Resolve
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(alert._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                          title="Delete alert"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                );
              }}
            />
          )}
        </ComponentCard>
      </div>

      {/* Conversation History Modal */}
      <ConversationHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, messages: [], title: '' })}
        messages={historyModal.messages}
        sessionTitle={historyModal.title}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
}