"use client";
import React from 'react';
import { 
  Building2, 
  Globe, 
  Mail, 
  FileText, 
  MessageSquare,
  Settings,
  Bell,
  Calendar,
  ExternalLink,
  CheckCircle,
  Edit2
} from 'lucide-react';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import { getToneIcon, getSectorIcon, getSectorLabel } from '@/lib/business';
import toast from 'react-hot-toast';
import { updateBusinessTheme, resetBusinessTheme } from '@/services/apiService';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';
import { useAppContext } from '@/context/AppContext';
export default function BusinessView({ business, onEdit, showEdit = false }) {

  if ( !business) {
    return;
  }

  const handleThemeSave = async (colors) => {
    try {
      const response = await updateBusinessTheme(business._id, colors);
      toast.success('Theme colors updated successfully! check the chatbot to see the changes', {
        duration: 3000,
        position: 'top-center',
      });
      // Optional: refresh business data to update UI
    } catch (error) {
      toast.error('Failed to update theme colors', {
        duration: 3000,
        position: 'top-center',
      });
    }
  }
  const handleResetTheme = async () => {
    try {
      const response = await resetBusinessTheme(business._id);
      toast.success('Theme colors reset successfully! check the chatbot to see the changes', {
        duration: 3000,
        position: 'top-center',
      });
      return response;
    } catch (error) {
      toast.error('Failed to reset theme colors', {
        duration: 3000,
        position: 'top-center',
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Business Details Card */}
      <ComponentCard>
        <div className="p-8 space-y-8">
          {/* Business Header */}
          <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 flex items-center justify-center overflow-hidden border-2 border-brand-200 dark:border-brand-500/20">
                {business?.logoUrl? (
                  <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-brand-600 dark:text-brand-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {business.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge size="sm" color="success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getSectorIcon(business.sector)} {getSectorLabel(business.sector)}
                </span>
              </div>
            </div>
            {showEdit && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-lg border border-brand-500 text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors inline-flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          {/* Business Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-500/10">
                  <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                Business Email
              </div>
              <p className="text-sm text-gray-900 dark:text-white pl-10">
                {business.businessEmail}
              </p>
            </div>

            {/* Alert Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="rounded-lg bg-error-50 p-2 dark:bg-error-500/10">
                  <Bell className="h-4 w-4 text-error-600 dark:text-error-400" />
                </div>
                Alert Email
              </div>
              <p className="text-sm text-gray-900 dark:text-white pl-10">
                {business.alertEmail}
              </p>
            </div>

            {/* Website */}
            {business.website && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-500/10">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Website
                </div>
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline pl-10 flex items-center gap-1"
                >
                  {business.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                  <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                Created
              </div>
              <p className="text-sm text-gray-900 dark:text-white pl-10">
                {new Date(business.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <FileText className="h-4 w-4 text-gray-500" />
                Description
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          {/* Chatbot Settings */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <Settings className="h-4 w-4 text-gray-500" />
              Chatbot Configuration
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              <div className="rounded-lg bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 p-4 border border-brand-200 dark:border-brand-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Welcome Message
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {business.chatbotSettings?.welcomeMessage || 'Hi! How can I help you today?'}
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-success-50 to-teal-50 dark:from-success-500/10 dark:to-teal-500/10 p-4 border border-success-200 dark:border-success-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-success-600 dark:text-success-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Offline Message
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{business.chatbotSettings?.offlineMessage || 'We\'re currently offline. Leave a message and we\'ll get back to you soon!'}"
                </p>
              </div>
            </div>

            <ThemeCustomizer business={business} onSave={handleThemeSave} onReset={handleResetTheme}/>
          </div>

          {/* Chatbot Widget URL */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              Widget Integration
            </div>
            
            {/* Demo URL */}
            <div className="rounded-lg bg-gradient-to-br from-brand-50 to-purple-50 dark:from-success-500/10 dark:to-teal-500/10 p-6 border border-success-200 dark:border-success-500/20 mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Test your chatbot
              </p>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <code className="text-xs text-gray-800 dark:text-gray-300 font-mono break-all">
                    {`${process.env.NEXT_PUBLIC_WIDGET_URL}/demo?businessId=${business._id}`}
                  </code>
                </div>
                <div className="flex gap-2">
                <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_WIDGET_URL}/demo?businessId=${business._id}`);
                        toast.success('Demo URL copied to clipboard!', {
                          duration: 3000,
                          position: 'top-center',
                        });
                      } catch (err) {
                        toast.error('Failed to copy demo URL to clipboard', {
                          duration: 3000,
                          position: 'top-center',
                        });
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-success-500 text-white font-medium hover:bg-success-600 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Copy URL
                  </button>
                  <a
                    href={`${process.env.NEXT_PUBLIC_WIDGET_URL}/demo?businessId=${business._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg border border-success-500 text-success-600 dark:text-success-400 font-medium hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Demo
                  </a>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-brand-50 dark:from-purple-500/10 dark:to-brand-500/10 p-6 border border-purple-200 dark:border-purple-500/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add this script to your website's <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs">&lt;head&gt;</code> section
              </p>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <code className="text-xs text-gray-800 dark:text-gray-300 font-mono break-all">
                    {`<script src="${process.env.NEXT_PUBLIC_BACKEND_URL}/widget/embed.js" data-business-id="${business._id}"></script>`}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<script src="${process.env.NEXT_PUBLIC_BACKEND_URL}/widget/embed.js" data-business-id="${business._id}"></script>`
                    );
                    toast.success('Embed code copied to clipboard!', {
                      duration: 3000,
                      position: 'top-center',
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Copy Embed Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}