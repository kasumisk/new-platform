'use client';

import { IMAGE_FORMATS, OUTPUT_FORMATS } from '@/lib/image-converter';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FormatSelector({ value, onChange, disabled }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="format">目标格式</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="format" className="w-full">
          <SelectValue placeholder="选择格式" />
        </SelectTrigger>
        <SelectContent>
          {OUTPUT_FORMATS.map((formatId) => {
            const format = IMAGE_FORMATS[formatId];
            return (
              <SelectItem key={formatId} value={formatId}>
                <span className="font-medium">{format.name}</span>
                <span className="text-muted-foreground ml-2">({format.extension})</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
