/**
 * Date Range Picker Component
 * 
 * Visual date range selector.
 */

import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [start, setStart] = useState(startDate?.toISOString().split('T')[0] || '');
  const [end, setEnd] = useState(endDate?.toISOString().split('T')[0] || '');

  const handleStartChange = (value: string) => {
    setStart(value);
    onChange(value ? new Date(value) : undefined, end ? new Date(end) : undefined);
  };

  const handleEndChange = (value: string) => {
    setEnd(value);
    onChange(start ? new Date(start) : undefined, value ? new Date(value) : undefined);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStart(today);
    setEnd(today);
    onChange(new Date(today), new Date(today));
  };

  const setThisWeek = () => {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = lastDay.toISOString().split('T')[0];
    
    setStart(startStr);
    setEnd(endStr);
    onChange(new Date(startStr), new Date(endStr));
  };

  const setThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = lastDay.toISOString().split('T')[0];
    
    setStart(startStr);
    setEnd(endStr);
    onChange(new Date(startStr), new Date(endStr));
  };

  const clear = () => {
    setStart('');
    setEnd('');
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <div className="relative">
            <Input
              type="date"
              value={start}
              onChange={(e) => handleStartChange(e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <div className="relative">
            <Input
              type="date"
              value={end}
              onChange={(e) => handleEndChange(e.target.value)}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={setToday}>
          Today
        </Button>
        <Button size="sm" variant="outline" onClick={setThisWeek}>
          This Week
        </Button>
        <Button size="sm" variant="outline" onClick={setThisMonth}>
          This Month
        </Button>
        {(start || end) && (
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

