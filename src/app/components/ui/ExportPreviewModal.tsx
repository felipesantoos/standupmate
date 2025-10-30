/**
 * Export Preview Modal
 * 
 * Preview markdown before exporting.
 */

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { X, Download, Copy } from 'lucide-react';
import { useState } from 'react';

interface ExportPreviewModalProps {
  content: string;
  filename: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExportPreviewModal({ content, filename, onClose, onConfirm }: ExportPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Preview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{filename}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap font-mono">{content}</pre>
          </div>
        </CardContent>

        <div className="p-4 border-t border-border flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </Card>
    </div>
  );
}

