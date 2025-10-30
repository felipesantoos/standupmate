/**
 * Tag Color Picker Component
 * 
 * Allow users to customize tag colors.
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { X, Plus, Palette } from 'lucide-react';

interface TagColor {
  tag: string;
  color: string;
}

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export function TagColorPicker() {
  const [tagColors, setTagColors] = useState<TagColor[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    const saved = localStorage.getItem('tag-colors');
    if (saved) {
      setTagColors(JSON.parse(saved));
    }
  }, []);

  const saveColors = (colors: TagColor[]) => {
    setTagColors(colors);
    localStorage.setItem('tag-colors', JSON.stringify(colors));
  };

  const addTagColor = () => {
    if (!newTag.trim()) return;
    
    const exists = tagColors.find((tc) => tc.tag === newTag.trim());
    if (exists) {
      // Update existing
      const updated = tagColors.map((tc) =>
        tc.tag === newTag.trim() ? { ...tc, color: selectedColor } : tc
      );
      saveColors(updated);
    } else {
      // Add new
      saveColors([...tagColors, { tag: newTag.trim(), color: selectedColor }]);
    }
    
    setNewTag('');
  };

  const removeTagColor = (tag: string) => {
    saveColors(tagColors.filter((tc) => tc.tag !== tag));
  };

  const updateColor = (tag: string, color: string) => {
    saveColors(tagColors.map((tc) => (tc.tag === tag ? { ...tc, color } : tc)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Tag Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Tag Color */}
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag name"
            onKeyDown={(e) => e.key === 'Enter' && addTagColor()}
          />
          
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            style={{ width: '120px' }}
          >
            {PRESET_COLORS.map((color) => (
              <option key={color} value={color} style={{ backgroundColor: color }}>
                {color}
              </option>
            ))}
          </select>

          <Button onClick={addTagColor} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Existing Tag Colors */}
        {tagColors.length > 0 && (
          <div className="space-y-2">
            {tagColors.map((tc) => (
              <div key={tc.tag} className="flex items-center gap-2 p-2 border border-border rounded-md">
                <div
                  className="w-6 h-6 rounded-full border border-border"
                  style={{ backgroundColor: tc.color }}
                />
                <span className="flex-1 text-sm font-medium">{tc.tag}</span>
                
                <select
                  value={tc.color}
                  onChange={(e) => updateColor(tc.tag, e.target.value)}
                  className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {PRESET_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTagColor(tc.tag)}
                  className="px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {tagColors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No custom colors yet. Add colors for your tags!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get tag color from localStorage
 */
export function getTagColor(tag: string): string | undefined {
  const saved = localStorage.getItem('tag-colors');
  if (!saved) return undefined;
  
  const tagColors: TagColor[] = JSON.parse(saved);
  return tagColors.find((tc) => tc.tag === tag)?.color;
}

