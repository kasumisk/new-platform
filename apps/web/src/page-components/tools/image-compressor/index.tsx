'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  Shrink,
  X,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  Settings2,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, downloadBlob, createZipFromBlobs } from '@/lib/image-converter/utils';

interface CompressedImage {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  url: string;
  filename: string;
  format: string;
}

interface CompressApiResult {
  filename: string;
  originalSize: number;
  compressedSize: number;
  format: string;
  data: string; // base64 data URL
  error?: string;
}

// 从 base64 data URL 创建 Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([new Uint8Array(ab)], { type: mimeType });
}

// 获取压缩后的文件扩展名
function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.jpg';
  }
}

export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(85);
  const [enableResize, setEnableResize] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [isCompressing, setIsCompressing] = useState(false);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 20));
    setResults([]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 20,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  // 使用服务端 API 压缩
  const handleCompress = async () => {
    if (files.length === 0) return;

    setIsCompressing(true);
    setProgress({ current: 0, total: files.length });
    setError(null);

    try {
      // 创建 FormData
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('quality', String(quality));
      if (enableResize) {
        formData.append('maxWidth', String(maxWidth));
      }
      formData.append('keepFormat', 'true');

      // 调用压缩 API
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`压缩失败: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '压缩失败');
      }

      // 处理结果
      const compressed: CompressedImage[] = [];
      const apiResults = data.results as CompressApiResult[];

      for (let i = 0; i < apiResults.length; i++) {
        const result = apiResults[i];
        const originalFile = files.find((f) => f.name === result.filename);

        if (result.error || !originalFile) {
          console.error(`压缩失败: ${result.filename}`, result.error);
          continue;
        }

        const blob = dataUrlToBlob(result.data);
        const ext = getExtensionFromMime(result.format);
        const baseName = result.filename.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_compressed${ext}`;

        compressed.push({
          original: originalFile,
          compressed: blob,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          url: URL.createObjectURL(blob),
          filename,
          format: result.format,
        });

        setProgress({ current: i + 1, total: files.length });
      }

      setResults(compressed);
    } catch (err) {
      console.error('压缩错误:', err);
      setError(err instanceof Error ? err.message : '压缩失败，请重试');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (results.length === 1) {
      downloadBlob(results[0].compressed, results[0].filename);
      return;
    }

    const zipBlob = await createZipFromBlobs(
      results.map((r) => ({ blob: r.compressed, filename: r.filename }))
    );
    downloadBlob(zipBlob, 'compressed-images.zip');
  };

  const handleReset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFiles([]);
    setResults([]);
    setProgress({ current: 0, total: 0 });
    setError(null);
  };

  const totalSaved = results.reduce(
    (acc, r) => acc + Math.max(0, r.originalSize - r.compressedSize),
    0
  );
  const totalOriginal = results.reduce((acc, r) => acc + r.originalSize, 0);
  const avgReduction =
    results.length > 0 && totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      results.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shrink className="w-7 h-7" />
            图片压缩
          </h1>
          <p className="text-muted-foreground">专业级压缩，对标 TinyPNG，保持原格式和最佳画质</p>
        </div>
        {files.length > 0 && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新开始
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">选择图片</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50',
                  isCompressing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input {...getInputProps()} disabled={isCompressing} />
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-sm">拖拽或点击上传</p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 PNG, JPG, WebP, GIF（最多 20 张）
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                    >
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-background rounded"
                        disabled={isCompressing}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                压缩设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 服务端压缩提示 */}
              <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg text-sm">
                <Server className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-primary">专业压缩引擎</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    使用 Sharp + MozJPEG + PNG 量化，效果媲美 TinyPNG
                  </p>
                </div>
              </div>

              {/* 质量设置 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>压缩质量</Label>
                  <span className="text-sm text-muted-foreground">{quality}%</span>
                </div>
                <Slider
                  min={60}
                  max={100}
                  step={5}
                  value={[quality]}
                  onValueChange={([v]) => setQuality(v)}
                  disabled={isCompressing}
                />
                <p className="text-xs text-muted-foreground">
                  推荐 80-90%，PNG 自动使用调色板量化压缩
                </p>
              </div>

              {/* 可选：调整尺寸 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-resize">限制最大宽度</Label>
                  <Switch
                    id="enable-resize"
                    checked={enableResize}
                    onCheckedChange={setEnableResize}
                    disabled={isCompressing}
                  />
                </div>

                {enableResize && (
                  <div className="space-y-2 pl-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">最大宽度</span>
                      <span className="text-sm text-muted-foreground">{maxWidth}px</span>
                    </div>
                    <Slider
                      min={480}
                      max={4096}
                      step={64}
                      value={[maxWidth]}
                      onValueChange={([v]) => setMaxWidth(v)}
                      disabled={isCompressing}
                    />
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCompress}
                disabled={files.length === 0 || isCompressing}
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    压缩中 ({progress.current}/{progress.total})
                  </>
                ) : (
                  <>
                    <Shrink className="w-4 h-4 mr-2" />
                    开始压缩 {files.length > 0 && `(${files.length})`}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {results.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      压缩完成
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {totalSaved > 0
                        ? `共节省 ${formatFileSize(totalSaved)} (${avgReduction}%)`
                        : '已优化图片'}
                    </p>
                  </div>
                  <Button onClick={handleDownloadAll}>
                    <Download className="w-4 h-4 mr-2" />
                    {results.length > 1 ? '下载全部 (ZIP)' : '下载'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {results.map((result, index) => {
                    const saved = result.originalSize - result.compressedSize;
                    const reduction =
                      saved > 0 ? Math.round((saved / result.originalSize) * 100) : 0;
                    const increased = saved < 0;

                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-14 h-14 rounded overflow-hidden shrink-0 bg-background">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={result.url}
                            alt={result.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.filename}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={saved > 0 ? 'line-through' : ''}>
                              {formatFileSize(result.originalSize)}
                            </span>
                            <span>→</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(result.compressedSize)}
                            </span>
                            {saved > 0 ? (
                              <span className="text-green-500">-{reduction}%</span>
                            ) : increased ? (
                              <span className="text-orange-500 text-xs">
                                +{Math.abs(reduction)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">相同</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBlob(result.compressed, result.filename)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Shrink className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-medium mb-2">选择图片开始压缩</h3>
                <p className="text-sm text-muted-foreground mb-4">支持批量压缩，服务端处理更专业</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ PNG 调色板量化（类似 TinyPNG）</p>
                  <p>✓ JPG 使用 MozJPEG 编码器</p>
                  <p>✓ WebP/GIF 智能优化</p>
                  <p>✓ 保持原格式和透明通道</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
