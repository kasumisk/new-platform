'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { IMAGE_FORMATS } from '@/lib/image-converter';

interface QualitySliderProps {
  value: number;
  onChange: (value: number) => void;
  targetFormat: string;
  disabled?: boolean;
}

export function QualitySlider({ value, onChange, targetFormat, disabled }: QualitySliderProps) {
  const format = IMAGE_FORMATS[targetFormat];
  const supportsQuality = format?.supportsQuality ?? false;

  if (!supportsQuality) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="quality">输出质量</Label>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Slider
        id="quality"
        min={10}
        max={100}
        step={5}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled || !supportsQuality}
      />
      <p className="text-xs text-muted-foreground">较高质量会产生较大文件</p>
    </div>
  );
}
