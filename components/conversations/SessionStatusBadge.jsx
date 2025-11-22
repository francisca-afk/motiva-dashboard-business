import React from 'react';
import Badge from '@/components/ui/badge/Badge';

/**
 * SessionStatusBadge Component
 * Shows session status with animated indicator for active sessions
 */
export default function SessionStatusBadge({ status}) {
  const isActive = status === 'active' 
  
  const getStatusColor = () => {
    if (isActive) return 'success';
    if (status === 'archived') return 'default';
    return 'warning';
  };

  const getStatusLabel = () => {
    if (isActive) return 'Active';
    if (status === 'archived') return 'Archived';
    return 'Inactive';
  };

  return (
    <div className="flex items-center gap-2">
      {isActive && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
        </span>
      )}
      <Badge size="sm" color={getStatusColor()}>
        {getStatusLabel()}
      </Badge>
    </div>
  );
}
