/**
 * Field Property Editor Component
 * 
 * Panel for editing field properties.
 */

import { Field, FieldType } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Input } from '@app/components/ui/input';
import { Button } from '@app/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

interface FieldPropertyEditorProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onClose: () => void;
}

export function FieldPropertyEditor({ field, onUpdate, onClose }: FieldPropertyEditorProps) {
  const [localField, setLocalField] = useState(field);

  const handleUpdate = (key: keyof Field, value: any) => {
    const updated = { ...localField, [key]: value };
    setLocalField(updated);
    onUpdate({ [key]: value });
  };

  const handleValidationUpdate = (key: string, value: any) => {
    const validation = { ...localField.validation, [key]: value };
    setLocalField({ ...localField, validation });
    onUpdate({ validation });
  };

  const addOption = () => {
    const options = [...(localField.options || []), ''] as string[];
    setLocalField({ ...localField, options });
    onUpdate({ options });
  };

  const updateOption = (index: number, value: string) => {
    const options = [...(localField.options || [])] as string[];
    options[index] = value;
    setLocalField({ ...localField, options });
    onUpdate({ options });
  };

  const removeOption = (index: number) => {
    const options = [...(localField.options || [])] as string[];
    options.splice(index, 1);
    setLocalField({ ...localField, options });
    onUpdate({ options });
  };

  const fieldTypesRequiringOptions = [FieldType.SELECT, FieldType.RADIO];
  const showOptions = fieldTypesRequiringOptions.includes(localField.type);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Field Properties</CardTitle>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium mb-2">Label</label>
          <Input
            value={localField.label}
            onChange={(e) => handleUpdate('label', e.target.value)}
            placeholder="Field name"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={localField.type}
            onChange={(e) => handleUpdate('type', e.target.value as FieldType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={FieldType.TEXT}>Short Text</option>
            <option value={FieldType.TEXTAREA}>Long Text</option>
            <option value={FieldType.NUMBER}>Number</option>
            <option value={FieldType.DATE}>Date</option>
            <option value={FieldType.CHECKBOX}>Checkbox</option>
            <option value={FieldType.RADIO}>Radio Button</option>
            <option value={FieldType.SELECT}>Select/Dropdown</option>
            <option value={FieldType.MARKDOWN}>Markdown</option>
          </select>
        </div>

        {/* Placeholder */}
        <div>
          <label className="block text-sm font-medium mb-2">Placeholder</label>
          <Input
            value={localField.placeholder || ''}
            onChange={(e) => handleUpdate('placeholder', e.target.value)}
            placeholder="e.g. Enter here..."
          />
        </div>

        {/* Required */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={localField.required}
            onChange={(e) => handleUpdate('required', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label className="text-sm font-medium">Required field</label>
        </div>

        {/* Options (for SELECT and RADIO) */}
        {showOptions && (
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
              {(localField.options || []).map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.label;
                return (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={optionValue}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeOption(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              <Button size="sm" variant="outline" onClick={addOption} className="w-full">
                + Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Validation */}
        <div className="pt-4 border-t border-border">
          <label className="block text-sm font-medium mb-3">Validation</label>

          {(localField.type === FieldType.TEXT || localField.type === FieldType.TEXTAREA) && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Minimum Length
                </label>
                <Input
                  type="number"
                  value={localField.validation?.minLength || ''}
                  onChange={(e) =>
                    handleValidationUpdate('minLength', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Ex: 3"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Maximum Length
                </label>
                <Input
                  type="number"
                  value={localField.validation?.maxLength || ''}
                  onChange={(e) =>
                    handleValidationUpdate('maxLength', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Ex: 200"
                />
              </div>
            </div>
          )}

          {localField.type === FieldType.NUMBER && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Minimum Value</label>
                <Input
                  type="number"
                  value={localField.validation?.min || ''}
                  onChange={(e) =>
                    handleValidationUpdate('min', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Ex: 0"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Maximum Value</label>
                <Input
                  type="number"
                  value={localField.validation?.max || ''}
                  onChange={(e) =>
                    handleValidationUpdate('max', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Ex: 100"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

