/**
 * Template Preview Component
 * 
 * Live preview of how the template will look when filling a ticket.
 */

import { Template } from '@core/domain/Template';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { DynamicField } from '../form/DynamicField';
import { useState } from 'react';

interface TemplatePreviewProps {
  template: Template;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [previewData, setPreviewData] = useState<Record<string, any>>({});

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preview of how the form will look
        </p>
      </CardHeader>

      <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {template.sections.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Add sections to see preview
          </p>
        ) : (
          template.sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                {section.title || 'No title'}
              </h3>
              
              {section.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No fields in this section
                </p>
              ) : (
                section.fields.map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={previewData[field.id]}
                    onChange={(value) => setPreviewData({ ...previewData, [field.id]: value })}
                  />
                ))
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

