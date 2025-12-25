'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReminderTimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

// Generate time options in 30-minute intervals
const TIME_OPTIONS: { value: string; label: string }[] = [];

for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    const value = `${h}:${m}`;

    // Format for display
    const displayHour = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    const label = `${displayHour}:${m} ${period}`;

    TIME_OPTIONS.push({ value, label });
  }
}

export function ReminderTimeSelector({
  value,
  onChange,
  label = 'Time',
}: ReminderTimeSelectorProps) {
  // Find the display label for the current value
  const selectedOption = TIME_OPTIONS.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || value;

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time">{displayValue}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
