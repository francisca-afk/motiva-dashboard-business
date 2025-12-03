"use client";
import React, { useState } from 'react';
import { X, Mail, Shield, Check, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    description: 'Full access to everything including user management',
    color: 'error',
    icon: '👑'
  },
  admin: {
    label: 'Admin',
    description: 'Can manage business settings and knowledge base',
    color: 'warning',
    icon: '⚡'
  },
  chatRep: {
    label: 'Chat Representative',
    description: 'Can view and reply to conversations',
    color: 'success',
    icon: '💬'
  }
};

export default function InviteUserModal({ isOpen, onClose, onInvite, currentUserRole }) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('chatRep');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite({ email, role: selectedRole });
      setEmail('');
      setSelectedRole('chatRep');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Only owners can invite other owners
  const availableRoles = currentUserRole === 'owner' 
    ? ['owner', 'admin', 'chatRep']
    : ['admin', 'chatRep'];

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10">
              <Mail className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Invite Team Member
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send an invitation to join your organization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Select Role
            </label>
            <div className="space-y-3">
              {availableRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                return (
                  <label
                    key={role}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRole === role
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {config.label}
                        </span>
                        <Badge size="sm" color={config.color}>
                          {role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {config.description}
                      </p>
                    </div>
                    {selectedRole === role && (
                      <Check className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-1" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20">
              <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400 flex-shrink-0" />
              <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}