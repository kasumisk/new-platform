'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { Upload, Copy, Pipette, X, RefreshCw, CheckCircle, Plus, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

// EyeDropper API 类型声明
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperAPI {
  open: () => Promise<EyeDropperResult>;
}

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperAPI;
  }
}

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number) {
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function ColorPicker() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [currentColor, setCurrentColor] = useState<ExtractedColor | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isScreenPicking, setIsScreenPicking] = useState(false);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 检测 EyeDropper API 支持
  useEffect(() => {
    setEyeDropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setColors([]);
      setCurrentColor(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 1,
  });

  // Draw image on canvas when loaded
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size to match image aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      imgRef.current = img;
    };
    img.src = imageUrl;

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPicking) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const r = pixel[0],
      g = pixel[1],
      b = pixel[2];

    const color: ExtractedColor = {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
    };

    setCurrentColor(color);
    setIsPicking(false);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPicking) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const r = pixel[0],
      g = pixel[1],
      b = pixel[2];

    setCurrentColor({
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
    });
  };

  const addColorToPalette = () => {
    if (currentColor && !colors.find((c) => c.hex === currentColor.hex)) {
      setColors((prev) => [...prev, currentColor]);
    }
  };

  const removeColor = (hex: string) => {
    setColors((prev) => prev.filter((c) => c.hex !== hex));
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  // 屏幕取色功能
  const handleScreenPick = async () => {
    if (!window.EyeDropper) {
      alert('您的浏览器不支持屏幕取色功能，请使用 Chrome 95+ 或 Edge 95+');
      return;
    }

    setIsScreenPicking(true);
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      // 解析 HEX 颜色
      const hex = result.sRGBHex.toUpperCase();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const color: ExtractedColor = {
        hex,
        rgb: { r, g, b },
        hsl: rgbToHsl(r, g, b),
      };

      setCurrentColor(color);
    } catch {
      // 用户取消选择（按 ESC），不做处理
    } finally {
      setIsScreenPicking(false);
    }
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setColors([]);
    setCurrentColor(null);
    setIsPicking(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pipette className="w-7 h-7" />
            取色器
          </h1>
          <p className="text-muted-foreground">从图片或屏幕中提取颜色，支持多种颜色格式</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 屏幕取色按钮 */}
          {eyeDropperSupported && (
            <Button
              variant={isScreenPicking ? 'default' : 'outline'}
              onClick={handleScreenPick}
              disabled={isScreenPicking}
            >
              <Monitor className="w-4 h-4 mr-2" />
              {isScreenPicking ? '取色中...' : '屏幕取色'}
            </Button>
          )}
          {imageUrl && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新开始
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Image */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">图片</CardTitle>
                {imageUrl && (
                  <Button
                    variant={isPicking ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsPicking(!isPicking)}
                  >
                    <Pipette className="w-4 h-4 mr-2" />
                    {isPicking ? '取色中...' : '开始取色'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!imageUrl ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors min-h-[300px] flex flex-col items-center justify-center',
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="font-medium">拖拽或点击上传图片</p>
                  <p className="text-sm text-muted-foreground mt-2">支持 PNG, JPG, WebP, GIF</p>
                </div>
              ) : (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMove}
                    className={cn(
                      'max-w-full mx-auto rounded-lg border shadow-sm',
                      isPicking && 'cursor-crosshair'
                    )}
                  />
                  {isPicking && (
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      <Pipette className="w-4 h-4" />
                      点击图片提取颜色
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Color Info & Palette */}
        <div className="space-y-6">
          {/* Current Color */}
          {currentColor && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">当前颜色</CardTitle>
                  <Button size="sm" variant="outline" onClick={addColorToPalette}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加到调色板
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="w-full h-24 rounded-lg border shadow-inner"
                  style={{ backgroundColor: currentColor.hex }}
                />

                <div className="space-y-2">
                  {/* HEX */}
                  <div className="flex items-center gap-2">
                    <Label className="w-12 shrink-0">HEX</Label>
                    <Input value={currentColor.hex} readOnly className="font-mono" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(currentColor.hex)}
                    >
                      {copied === currentColor.hex ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* RGB */}
                  <div className="flex items-center gap-2">
                    <Label className="w-12 shrink-0">RGB</Label>
                    <Input
                      value={`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`
                        )
                      }
                    >
                      {copied ===
                      `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* HSL */}
                  <div className="flex items-center gap-2">
                    <Label className="w-12 shrink-0">HSL</Label>
                    <Input
                      value={`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`
                        )
                      }
                    >
                      {copied ===
                      `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Color Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                调色板 {colors.length > 0 && `(${colors.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {colors.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <div
                      key={color.hex}
                      className="group relative aspect-square rounded-lg border shadow-sm cursor-pointer hover:ring-2 ring-primary"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex)}
                      title={color.hex}
                    >
                      <button
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColor(color.hex);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {copied === color.hex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Pipette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>从图片中取色后添加到这里</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          {!imageUrl && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">使用说明</h4>
                <div className="text-sm text-muted-foreground space-y-3">
                  <div>
                    <p className="font-medium text-foreground mb-1">📷 图片取色</p>
                    <ol className="space-y-1 list-decimal list-inside pl-2">
                      <li>上传一张图片</li>
                      <li>点击「开始取色」按钮</li>
                      <li>在图片上点击提取颜色</li>
                    </ol>
                  </div>
                  {eyeDropperSupported && (
                    <div>
                      <p className="font-medium text-foreground mb-1">🖥️ 屏幕取色</p>
                      <ol className="space-y-1 list-decimal list-inside pl-2">
                        <li>点击「屏幕取色」按钮</li>
                        <li>在屏幕任意位置点击取色</li>
                        <li>按 ESC 取消</li>
                      </ol>
                    </div>
                  )}
                  {!eyeDropperSupported && (
                    <p className="text-xs text-orange-500">
                      💡 屏幕取色需要 Chrome 95+ 或 Edge 95+ 浏览器
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
