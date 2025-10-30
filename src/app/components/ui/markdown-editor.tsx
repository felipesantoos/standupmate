/**
 * Markdown Editor Component - Simple Two-Panel Design
 * 
 * Left panel: Raw markdown text input
 * Right panel: Live HTML preview
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import { Button } from './button';
import { Code, Eye, Columns } from 'lucide-react';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  className?: string;
}

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

type ViewMode = 'raw' | 'preview' | 'split';

export function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Escreva seu conteúdo em markdown...',
  minLength,
  maxLength,
  className,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(value);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Sync with external value changes
  useEffect(() => {
    if (value !== markdown) {
      setMarkdown(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (newValue: string) => {
    setMarkdown(newValue);
    onChange?.(newValue);
  };

  const renderPreview = () => {
    if (!markdown) {
      return (
        <div className="text-muted-foreground italic p-4">
          Preview do markdown aparecerá aqui...
        </div>
      );
    }

    try {
      const html = marked.parse(markdown) as string;
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (error) {
      return (
        <div className="text-destructive p-4">
          Erro ao renderizar markdown: {(error as Error).message}
        </div>
      );
    }
  };

  const characterCount = markdown.length;
  const showCharCount = minLength || maxLength;

  return (
    <div className={cn(
      'flex flex-col rounded-lg border bg-background shadow-sm',
      className
    )}>
      {/* Toolbar with View Mode Buttons */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="text-sm font-medium text-muted-foreground">
          Markdown Editor
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={viewMode === 'raw' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('raw')}
            title="Mostrar apenas Markdown"
            className="h-8 px-2"
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Raw</span>
          </Button>
          <Button
            type="button"
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            title="Mostrar ambos lado a lado"
            className="h-8 px-2"
          >
            <Columns className="h-4 w-4" />
            <span className="hidden sm:inline">Split</span>
          </Button>
          <Button
            type="button"
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            title="Mostrar apenas Preview"
            className="h-8 px-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className={cn(
        'grid flex-1 overflow-hidden',
        viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}>
        {/* Left Panel - Raw Markdown Editor */}
        {(viewMode === 'raw' || viewMode === 'split') && (
          <div className={cn(
            'flex flex-col',
            viewMode === 'split' && 'border-r'
          )}>
            <div className="border-b bg-muted/40 px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">Markdown</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'flex-1 min-h-[300px] resize-none',
                'bg-transparent px-4 py-3',
                'text-sm font-mono leading-relaxed',
                'text-foreground placeholder:text-muted-foreground',
                'focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
        )}

        {/* Right Panel - HTML Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex flex-col">
            <div className="border-b bg-muted/40 px-3 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <div className="flex-1 min-h-[300px] overflow-auto">
              {renderPreview()}
            </div>
          </div>
        )}
      </div>

      {/* Character Count Footer */}
      {showCharCount && (
        <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              {characterCount} caractere{characterCount !== 1 ? 's' : ''}
            </span>
            {minLength && (
              <span className="text-muted-foreground/70">
                mín: {minLength}
              </span>
            )}
            {maxLength && (
              <span className="text-muted-foreground/70">
                máx: {maxLength}
              </span>
            )}
          </div>
          
          {/* Quick Reference */}
          <div className="hidden items-center gap-2 lg:flex">
            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
              **negrito**
            </code>
            <span className="text-muted-foreground/50">•</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
              *itálico*
            </code>
            <span className="text-muted-foreground/50">•</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
              # Título
            </code>
            <span className="text-muted-foreground/50">•</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
              - Lista
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
