'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface ResizeOptionsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  width: number | undefined;
  height: number | undefined;
  onWidthChange: (width: number | undefined) => void;
  onHeightChange: (height: number | undefined) => void;
  maintainAspectRatio: boolean;
  onMaintainAspectRatioChange: (maintain: boolean) => void;
  disabled?: boolean;
}

export function ResizeOptions({
  enabled,
  onEnabledChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  maintainAspectRatio,
  onMaintainAspectRatioChange,
  disabled,
}: ResizeOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="resize-enabled" className="cursor-pointer">
          调整尺寸
        </Label>
        <Switch
          id="resize-enabled"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="space-y-3 pl-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs">
                宽度 (px)
              </Label>
              <Input
                id="width"
                type="number"
                placeholder="自动"
                value={width || ''}
                onChange={(e) =>
                  onWidthChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
                min={1}
                max={10000}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height" className="text-xs">
                高度 (px)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="自动"
                value={height || ''}
                onChange={(e) =>
                  onHeightChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
                min={1}
                max={10000}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onCheckedChange={onMaintainAspectRatioChange}
              disabled={disabled}
            />
            <Label htmlFor="aspect-ratio" className="text-sm cursor-pointer">
              保持比例
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
