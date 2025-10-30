/**
 * Dynamic Field Component
 * 
 * Renders form fields dynamically based on field type.
 */

import { Field, FieldType } from '@core/domain/types';
import { Input } from '@app/components/ui/Input';
import { useState } from 'react';

interface DynamicFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
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
          <textarea
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <input
              type="checkbox"
              checked={!!localValue}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">{field.placeholder || field.label}</span>
          </div>
        );

      case FieldType.RADIO:
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={localValue === option}
                  onChange={(e) => handleChange(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case FieldType.SELECT:
        return (
          <select
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case FieldType.MARKDOWN:
        return (
          <textarea
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder || 'Markdown suportado...'}
            required={field.required}
            rows={8}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
}

