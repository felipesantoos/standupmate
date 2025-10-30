/**
 * Template Preview Modal Component
 * 
 * Full-screen modal to preview how the template will look when filling a ticket.
 * Includes options to view with or without sample data.
 */

import { Template } from '@core/domain/Template';
import { Field, FieldType } from '@core/domain/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { DynamicField } from '../form/DynamicField';
import { useState } from 'react';
import { Sparkles, Eraser } from 'lucide-react';
import { ScrollArea } from '@app/components/ui/scroll-area';

interface TemplatePreviewModalProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Generates sample data for a field based on its type
 */
function generateSampleData(field: Field): any {
  switch (field.type) {
    case FieldType.TEXT:
      // Generate meaningful sample text based on label
      const labelLower = field.label.toLowerCase();
      if (labelLower.includes('name') || labelLower.includes('nome')) {
        return 'João Silva';
      }
      if (labelLower.includes('email')) {
        return 'joao.silva@example.com';
      }
      if (labelLower.includes('title') || labelLower.includes('título')) {
        return 'Implementar funcionalidade de autenticação';
      }
      return 'Exemplo de texto';

    case FieldType.TEXTAREA:
      return 'Este é um exemplo de texto mais longo que demonstra como o campo de texto multilinha aparecerá quando preenchido pelo usuário. Você pode adicionar várias linhas de informação aqui.';

    case FieldType.MARKDOWN:
      return '# Título do Exemplo\n\nEste é um exemplo de conteúdo em **Markdown**.\n\n- Item 1\n- Item 2\n- Item 3\n\n```\nCódigo de exemplo\n```';

    case FieldType.NUMBER:
      // Generate numbers based on label context
      const numLabel = field.label.toLowerCase();
      if (numLabel.includes('hour') || numLabel.includes('hora')) {
        return 8;
      }
      if (numLabel.includes('percent') || numLabel.includes('porcent')) {
        return 75;
      }
      return 42;

    case FieldType.DATE:
      // Return today's date in ISO format
      return new Date().toISOString().split('T')[0];

    case FieldType.CHECKBOX:
      // Alternate between true and false based on field ID
      return field.id.charCodeAt(field.id.length - 1) % 2 === 0;

    case FieldType.RADIO:
    case FieldType.SELECT:
      // Select first option if available
      if (field.options && field.options.length > 0) {
        const firstOption = field.options[0];
        return typeof firstOption === 'string' ? firstOption : firstOption.value;
      }
      return '';

    case FieldType.CHECKLIST:
      return [];

    default:
      return '';
  }
}

/**
 * Generates sample data for all fields in the template
 */
function generateAllSampleData(template: Template): Record<string, any> {
  const sampleData: Record<string, any> = {};
  
  template.sections.forEach(section => {
    section.fields.forEach(field => {
      sampleData[field.id] = generateSampleData(field);
    });
  });

  return sampleData;
}

export function TemplatePreviewModal({ template, open, onOpenChange }: TemplatePreviewModalProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [showSampleData, setShowSampleData] = useState(false);

  const handleFillSampleData = () => {
    const sampleData = generateAllSampleData(template);
    setPreviewData(sampleData);
    setShowSampleData(true);
  };

  const handleClearData = () => {
    setPreviewData({});
    setShowSampleData(false);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setPreviewData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Preview do Template</DialogTitle>
              <DialogDescription className="mt-2">
                Visualize como o formulário aparecerá ao ser preenchido
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {showSampleData ? (
                <Button variant="outline" size="sm" onClick={handleClearData}>
                  <Eraser className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleFillSampleData}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Dados de Exemplo
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="px-6 py-6">
            {/* Template Header */}
            <div className="mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {template.name}
              </h2>
              {template.description && (
                <p className="text-muted-foreground">
                  {template.description}
                </p>
              )}
            </div>

            {/* Template Sections and Fields */}
            {template.sections.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Este template não possui seções ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {template.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
                      <h3 className="text-xl font-semibold text-foreground">
                        {section.title}
                      </h3>
                    </div>
                    
                    {section.fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-4">
                        Esta seção não possui campos
                      </p>
                    ) : (
                      <div className="space-y-6 pt-2">
                        {section.fields.map((field) => (
                          <DynamicField
                            key={field.id}
                            field={field}
                            value={previewData[field.id]}
                            onChange={(value) => handleFieldChange(field.id, value)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer Actions Preview */}
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" disabled>
                Cancelar
              </Button>
              <Button disabled>
                Salvar Ticket
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

