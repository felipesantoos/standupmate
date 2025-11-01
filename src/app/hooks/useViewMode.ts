/**
 * useViewMode Hook
 * 
 * Hook to manage and persist view mode preference (cards vs table).
 * Uses localStorage to save user preference.
 */

import { useState, useEffect } from 'react';

export type ViewMode = 'cards' | 'table';

/**
 * Hook to manage view mode with localStorage persistence
 * 
 * @param key - Unique key for localStorage (e.g., 'tickets', 'templates')
 * @param defaultValue - Default view mode (defaults to 'cards')
 * @returns Tuple of [viewMode, setViewMode]
 */
export function useViewMode(key: string, defaultValue: ViewMode = 'cards') {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(`viewMode:${key}`);
      return (stored as ViewMode) || defaultValue;
    } catch (error) {
      console.warn('Failed to read view mode from localStorage:', error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`viewMode:${key}`, viewMode);
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
  }, [key, viewMode]);

  return [viewMode, setViewMode] as const;
}

