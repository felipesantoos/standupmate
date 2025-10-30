/**
 * Import Template Modal
 * 
 * Upload and import template from JSON file.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { X, Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplates } from '@app/hooks/useTemplates';

interface ImportTemplateModalProps {
  onClose: () => void;
}

export function ImportTemplateModal({ onClose }: ImportTemplateModalProps) {
  const [jsonContent, setJsonContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { importFromJSON } = useTemplates();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      toast.error('Please select a JSON file.');
      return;
    }

    setFile(selectedFile);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);

      // Try to parse and show preview
      try {
        const parsed = JSON.parse(content);
        setPreview(parsed);
      } catch (error) {
        toast.error('Could not parse JSON file.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!jsonContent) {
      toast.warning('Please select a JSON file.');
      return;
    }

    try {
      await importFromJSON(jsonContent);
      toast.success('Template imported successfully.');
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Import Template</CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="json-upload"
            />
            <label
              htmlFor="json-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileJson className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Click to select JSON file</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {file ? file.name : 'Or drag a file here'}
                </p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-3">
              <h3 className="font-semibold">Preview:</h3>
              <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {preview.name || 'N/A'}
                </p>
                <p>
                  <strong>Description:</strong> {preview.description || 'N/A'}
                </p>
                <p>
                  <strong>Version:</strong> {preview.version || 'N/A'}
                </p>
                <p>
                  <strong>Sections:</strong> {preview.sections?.length || 0}
                </p>
                <p>
                  <strong>Total Fields:</strong>{' '}
                  {preview.sections?.reduce((acc: number, s: any) => acc + (s.fields?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!jsonContent}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}

