import React from 'react';
import { Smile, Frown, Zap, Wind, AlertTriangle, Coffee } from 'lucide-react';

/**
 * MoodIndicator Component
 * Visual representation of conversation mood with alert styling
 */
export default function MoodIndicator({ 
  currentMood, 
  negativeCount = 0, 
  positiveCount = 0,
  moodChanges = 0,
  compact = false 
}) {
  const getMoodIcon = (mood) => {
    const iconClass = "h-4 w-4";
    switch (mood) {
      case 'positive':
        return <Smile className={iconClass} />;
      case 'negative':
        return <Frown className={iconClass} />;
      case 'excited':
        return <Zap className={iconClass} />;
      case 'calm':
        return <Wind className={iconClass} />;
      case 'frustrated':
        return <AlertTriangle className={iconClass} />;
      case 'tired':
        return <Coffee className={iconClass} />;
      default:
        return null;
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'positive':
      case 'excited':
      case 'calm':
        return 'text-success-600 dark:text-success-400';
      case 'negative':
      case 'frustrated':
        return 'text-error-600 dark:text-error-400';
      case 'tired':
        return 'text-warning-600 dark:text-warning-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getMoodLabel = (mood) => {
    return mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'None';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${getMoodColor(currentMood)}`}>
        {getMoodIcon(currentMood)}
        <span className="text-sm font-medium">
          {getMoodLabel(currentMood)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 ${getMoodColor(currentMood)}`}>
        {getMoodIcon(currentMood)}
        <span className="text-sm font-medium">
          {getMoodLabel(currentMood)}
        </span>
      </div>
      
      {(positiveCount > 0 || negativeCount > 0) && (
        <div className="flex items-center gap-3 text-xs">
          {positiveCount > 0 && (
            <span className="text-success-600 dark:text-success-400">
              +{positiveCount} positive
            </span>
          )}
          {negativeCount > 0 && (
            <span className="text-error-600 dark:text-error-400">
              {negativeCount} negative
            </span>
          )}
        </div>
      )}

      {moodChanges > 3 && (
        <div className="flex items-center gap-1.5 text-xs text-warning-600 dark:text-warning-400">
          <AlertTriangle className="h-3 w-3" />
          <span>Frequent mood changes ({moodChanges})</span>
        </div>
      )}
    </div>
  );
}