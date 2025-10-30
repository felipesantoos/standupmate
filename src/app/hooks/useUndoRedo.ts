/**
 * useUndoRedo Hook
 * 
 * Undo/Redo functionality for any state.
 */

import { useState, useCallback, useEffect } from 'react';

interface UndoRedoOptions {
  maxHistorySize?: number;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
) {
  const { maxHistorySize = 50 } = options;

  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update state and add to history
  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev)
        : newState;

      // Add to history
      setHistory((h) => {
        const newHistory = h.slice(0, currentIndex + 1);
        newHistory.push(nextState);
        
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          setCurrentIndex((i) => i - 1);
        }
        
        return newHistory;
      });
      
      setCurrentIndex((i) => Math.min(i + 1, maxHistorySize - 1));
      
      return nextState;
    });
  }, [currentIndex, maxHistorySize]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [currentIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [currentIndex, history]);

  // Reset history
  const reset = useCallback((newState: T) => {
    setState(newState);
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state,
    setState: updateState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historySize: history.length,
    currentIndex,
  };
}

