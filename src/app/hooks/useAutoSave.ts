/**
 * useAutoSave Hook
 * 
 * Debounced auto-save hook.
 * Saves data after user stops typing for X milliseconds.
 */

import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  saveNow: () => Promise<void>;
}

/**
 * Auto-save hook with debounce
 * 
 * @param options - Configuration
 * @returns Auto-save state and methods
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const previousDataRef = useRef<T>(data);
  const isFirstRender = useRef(true);

  /**
   * Save immediately
   */
  const saveNow = async () => {
    if (!enabled) return;

    try {
      setIsSaving(true);
      setError(null);

      await onSave(data);

      setLastSaved(new Date());
      previousDataRef.current = data;
    } catch (err) {
      setError(err as Error);
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Debounced save
   */
  useEffect(() => {
    if (!enabled) return;

    // Skip first render to avoid saving on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = data;
      return;
    }

    // Check if data changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, delay]);

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  };
}

