/**
 * Dynamic Field Component
 * 
 * Renders form fields dynamically based on field type.
 */

import { memo, useState, useEffect } from 'react';
import { Field, FieldType } from '@core/domain/types';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Checkbox } from '@app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { Label } from '@app/components/ui/label';
import { MarkdownEditor } from '@app/components/ui/markdown-editor';

interface DynamicFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const DynamicFieldComponent = ({ field, value, onChange, error }: DynamicFieldProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Helper to normalize options (support both string[] and FieldOption[])
  const normalizeOptions = () => {
    if (!field.options) return [];
    
    return field.options.map((option) => {
      if (typeof option === 'string') {
        return { value: option, label: option };
      }
      return option;
    });
  };

  const renderField = () => {
    switch (field.type) {
      case FieldType.TEXT:
        return (
          <Input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <Textarea
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            rows={5}
          />
        );

      case FieldType.NUMBER:
        return (
          <Input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case FieldType.DATE:
        return (
          <Input
            type="date"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        );

      case FieldType.CHECKBOX:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!localValue}
              onCheckedChange={(checked) => handleChange(checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      case FieldType.RADIO:
        const radioOptions = normalizeOptions();
        return (
          <RadioGroup value={localValue || ''} onValueChange={handleChange}>
            {radioOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case FieldType.SELECT:
        const selectOptions = normalizeOptions();
        return (
          <Select value={localValue || ''} onValueChange={handleChange}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case FieldType.MARKDOWN:
        return (
          <MarkdownEditor
            value={localValue || ''}
            onChange={handleChange}
            placeholder={field.placeholder || 'Escreva seu conteúdo...'}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className="block text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {renderField()}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {field.validation && (
        <p className="text-xs text-muted-foreground">
          {field.validation.minLength && `Min: ${field.validation.minLength} chars`}
          {field.validation.maxLength && ` | Max: ${field.validation.maxLength} chars`}
          {field.validation.min && `Min: ${field.validation.min}`}
          {field.validation.max && ` | Max: ${field.validation.max}`}
        </p>
      )}
    </div>
  );
};

/**
 * Memoized DynamicField
 * 
 * Only re-renders if field config, value, or error changes
 */
export const DynamicField = memo(DynamicFieldComponent, (prevProps, nextProps) => {
  return (
    prevProps.field.id === nextProps.field.id &&
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error
  );
});

DynamicField.displayName = 'DynamicField';

