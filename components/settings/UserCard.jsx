"use client";
import React, { useState } from 'react';
import { 
  MoreVertical, 
  Mail, 
  Trash2, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/DropdownMenu';

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: 'error', icon: '👑' },
  admin: { label: 'Admin', color: 'warning', icon: '⚡' },
  chatRep: { label: 'Chat Rep', color: 'success', icon: '💬' }
};

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'success',
    icon: CheckCircle,
    bgClass: 'bg-success-50 dark:bg-success-500/10'
  },
  pending: {
    label: 'Pending',
    color: 'warning',
    icon: Clock,
    bgClass: 'bg-warning-50 dark:bg-warning-500/10'
  },
  expired: {
    label: 'Expired',
    color: 'error',
    icon: AlertCircle,
    bgClass: 'bg-error-50 dark:bg-error-500/10'
  }
};

export default function UserCard({ 
  user, 
  currentUserRole,
  onChangeRole,
  onRemove,
  onResendInvite,
  onCancelInvite
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.chatRep;
  console.log("roleConfig", roleConfig);
  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  const canManage = currentUserRole === 'owner' || 
    (currentUserRole === 'admin' && user.role !== 'owner');

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAction = async (action, ...args) => {
    setIsUpdating(true);
    try {
      await action(...args);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`group relative rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 transition-all hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-lg ${
      isUpdating ? 'opacity-50 pointer-events-none' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 h-14 w-14 rounded-full ${statusConfig.bgClass} flex items-center justify-center font-bold text-lg`}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {getInitials(user.name || user.email)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user.name || 'Unnamed User'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Actions Menu */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user.status === 'pending' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleAction(onResendInvite, user._id)}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Resend Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(onCancelInvite, user._id)}
                        className="flex items-center gap-2 text-error-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel Invitation
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.status === 'active' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleAction(onChangeRole, user._id, 'admin')}
                        disabled={user.role === 'admin'}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Change to Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(onChangeRole, user._id, 'chatRep')}
                        disabled={user.role === 'chatRep'}
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Change to Chat Rep
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(onRemove, user._id)}
                        className="flex items-center gap-2 text-error-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove User
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge size="sm" color={roleConfig.color}>
              <span className="mr-1">{roleConfig.icon}</span>
              {roleConfig.label}
            </Badge>
            <Badge size="sm" color={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {user.isYou && (
              <Badge size="sm" color="info">
                You
              </Badge>
            )}
          </div>

          {/* Additional Info */}
          {user.invitedAt && user.status === 'pending' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Invited {new Date(user.invitedAt).toLocaleDateString()}
            </p>
          )}
          {user.joinedAt && user.status === 'active' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center">
          <div className="h-6 w-6 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}