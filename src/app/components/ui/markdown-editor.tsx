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
    <div className={cn('border rounded-md overflow-hidden', className)}>
      {/* Toolbar with View Mode Buttons */}
      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Markdown Editor
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('raw')}
            title="Mostrar apenas Markdown"
            className="h-8"
          >
            <Code className="h-4 w-4 mr-1" />
            Raw
          </Button>
          <Button
            type="button"
            variant={viewMode === 'split' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            title="Mostrar ambos lado a lado"
            className="h-8"
          >
            <Columns className="h-4 w-4 mr-1" />
            Split
          </Button>
          <Button
            type="button"
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            title="Mostrar apenas Preview"
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className={cn(
        'grid min-h-[300px]',
        viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}>
        {/* Left Panel - Raw Markdown Editor */}
        {(viewMode === 'raw' || viewMode === 'split') && (
          <div className={cn(viewMode === 'split' && 'border-r border-border')}>
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
              <span className="text-sm font-medium">Markdown</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full h-full min-h-[250px] p-4 resize-none',
                'bg-background text-foreground',
                'focus:outline-none',
                'font-mono text-sm',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>
        )}

        {/* Right Panel - HTML Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div>
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="overflow-auto h-full min-h-[250px] bg-muted/10">
              {renderPreview()}
            </div>
          </div>
        )}
      </div>

      {/* Character Count Footer */}
      {showCharCount && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t bg-muted/30 flex items-center justify-between">
          <div>
            {characterCount} caracteres
            {minLength && ` (mín: ${minLength})`}
            {maxLength && ` (máx: ${maxLength})`}
          </div>
          
          {/* Quick Reference */}
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">**negrito**</span>
            <span className="mx-2">•</span>
            <span className="font-mono">*itálico*</span>
            <span className="mx-2">•</span>
            <span className="font-mono"># Título</span>
            <span className="mx-2">•</span>
            <span className="font-mono">- Lista</span>
          </div>
        </div>
      )}
    </div>
  );
}
