/**
 * Tag Manager Component
 * 
 * Add, remove, and display tags for tickets.
 */

import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getTagColor } from './TagColorPicker';

interface TagManagerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagManager({ tags, onChange, suggestions = [] }: TagManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => 
      s.toLowerCase().includes(inputValue.toLowerCase()) && 
      !tags.includes(s)
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Tags</label>
      
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => {
          const customColor = getTagColor(tag);
          const style = customColor
            ? {
                backgroundColor: `${customColor}20`,
                color: customColor,
                border: `1px solid ${customColor}40`,
              }
            : {};
          
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                !customColor ? 'bg-primary/10 text-primary' : ''
              }`}
              style={style}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 rounded-sm p-0.5"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>

      {/* Input */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Add tag..."
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addTag(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter to add or click a suggestion
      </p>
    </div>
  );
}

