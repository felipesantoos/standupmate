/**
 * Command Palette Component
 * 
 * Quick access to actions via Cmd+K.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './Input';
import { Card } from './Card';
import { 
  FileText, 
  Layout, 
  Settings, 
  Plus, 
  Search,
  Home
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'new-ticket',
        label: 'New Ticket',
        description: 'Create a new ticket',
        icon: Plus,
        action: () => navigate('/tickets/new'),
        keywords: ['new', 'create', 'ticket'],
      },
      {
        id: 'tickets',
        label: 'View Tickets',
        description: 'Go to tickets list',
        icon: FileText,
        action: () => navigate('/tickets'),
        keywords: ['tickets', 'list', 'view'],
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Go to dashboard',
        icon: Home,
        action: () => navigate('/dashboard'),
        keywords: ['dashboard', 'home'],
      },
      {
        id: 'templates',
        label: 'Templates',
        description: 'Manage templates',
        icon: Layout,
        action: () => navigate('/templates'),
        keywords: ['templates', 'forms'],
      },
      {
        id: 'new-template',
        label: 'New Template',
        description: 'Create a new template',
        icon: Plus,
        action: () => navigate('/templates/builder/new'),
        keywords: ['template', 'new', 'create', 'builder'],
      },
      {
        id: 'settings',
        label: 'Settings',
        description: 'Open settings',
        icon: Settings,
        action: () => navigate('/settings'),
        keywords: ['settings', 'config'],
      },
    ],
    [navigate]
  );

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.includes(searchLower))
    );
  }, [search, commands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 px-4">
        <Card className="shadow-2xl">
          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search actions..."
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No actions found</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

