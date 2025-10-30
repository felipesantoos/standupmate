/**
 * Keyboard Shortcuts Hook
 * 
 * Global keyboard shortcuts for productivity.
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

/**
 * Common keyboard shortcuts
 */
export const SHORTCUTS = {
  SAVE: { key: 's', meta: true, description: 'Save' },
  NEW: { key: 'n', meta: true, description: 'New Ticket' },
  SEARCH: { key: 'f', meta: true, description: 'Search' },
  EXPORT: { key: 'e', meta: true, description: 'Export' },
  ESCAPE: { key: 'Escape', description: 'Cancel/Close' },
  HELP: { key: '?', shift: true, description: 'Show shortcuts' },
  COMMAND_PALETTE: { key: 'k', meta: true, description: 'Command Palette' },
} as const;

