"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search,
  Filter,
  Mail,
  RefreshCcw
} from 'lucide-react';
import ComponentCard from '@/components/common/ComponentCard';
import InviteUserModal from '@/components/settings/InviteUserModal';
import UserCard from '@/components/settings/UserCard';
import toast from 'react-hot-toast';
import {
  getBusinessUsers,
  inviteUser,
  updateUserRole,
  removeUser,
  resendInvitation,
  cancelInvitation,
  getPermissionsAndRoles
} from '@/services/apiService';
import { useAppContext } from '@/context/AppContext';

export default function UsersPage() {
  const { business, user, currentUserRole, hasPermission, permissionsLoaded } = useAppContext();
  
  if (!permissionsLoaded) return null;
  if (!hasPermission('manage_users')) {
    return <PageGuard />;
  }

  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');


  // Load data when business is available
  useEffect(() => {
    if(!business) return;
    loadData();
  }, [business]);

  const loadData = async () => {
    if(!business) return;
    setIsLoading(true);
    try {
        const usersData = await getBusinessUsers(business?._id);
        console.log('usersData', usersData);
        const filteredUsers = usersData.data.users.filter(u => u._id !== user._id);
        setUsers(filteredUsers || []);
        setInvitations(usersData.data.invitations || []);
    } catch (error) {
        toast.error('Failed to load users');
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleInvite = async (inviteData) => {
    try {
      await inviteUser(business._id, inviteData);
      toast.success(`Invitation sent to ${inviteData.email}`);
      loadData();
    } catch (error) {
      throw new Error(error.message || 'Failed to send invitation');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRole(business._id, userId, newRole);
      toast.success('User role updated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    
    try {
      await removeUser(business._id, userId);
      toast.success('User removed successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const handleResendInvite = async (invitationId) => {
    try {
      await resendInvitation(business._id, invitationId);
      toast.success('Invitation resent successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const handleCancelInvite = async (invitationId) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;
    
    try {
      await cancelInvitation(business._id, invitationId);
      toast.success('Invitation cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  // Show loading state while business is loading from AppContext
  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="h-5 w-5 text-brand-600 dark:text-brand-400 animate-spin" onClick={loadData} />
        <p className="text-gray-600 dark:text-gray-400 ml-2">Loading information about your team members...</p>
      </div>
    );
  }

  // Filter and search logic
  const allUsers = [...users, ...invitations.map(inv => ({
    ...inv,
    status: inv.status || 'pending',
    name: inv.invitedEmail || inv.email 
  }))];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: allUsers.length,
    active: users.filter(u => u.status === 'active').length,
    pending: invitations.length,
    owners: allUsers.filter(u => u.role === 'owner').length,
    admins: allUsers.filter(u => u.role === 'admin').length,
    chatReps: allUsers.filter(u => u.role === 'chatRep').length
  };

  const canInviteUsers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team members and their access levels
          </p>
        </div>
        {canInviteUsers && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:from-brand-600 hover:to-purple-600 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            Invite User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComponentCard>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success-50 dark:bg-success-500/10">
                <Shield className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-500/10">
                <Mail className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 flex-1">
                <div>
                  <p className="text-xs text-gray-500">👑 {stats.owners}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">⚡ {stats.admins}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">💬 {stats.chatReps}</p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Filters and Search */}
      <ComponentCard>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="chatRep">Chat Rep</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Active filters indicator */}
          {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredUsers.length} of {allUsers.length} users
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Users List */}
      <ComponentCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Members
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'No users match your filters'
                  : 'No team members yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  currentUserRole={currentUserRole}
                  onChangeRole={handleChangeRole}
                  onRemove={handleRemoveUser}
                  onResendInvite={handleResendInvite}
                  onCancelInvite={handleCancelInvite}
                />
              ))}
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}