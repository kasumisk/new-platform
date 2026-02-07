'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  Shrink,
  X,
  RefreshCw,
  Loader2,
  FileVideo,
  CheckCircle,
  Settings2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getFFmpeg,
  fetchFile,
  compressionPresets,
  resolutionPresets,
  formatFileSize,
  formatDuration,
  getVideoInfo,
} from '@/lib/ffmpeg';

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

interface CompressedVideo {
  original: File;
  compressed: Blob;
  originalSize: number;
  compressedSize: number;
  url: string;
  filename: string;
}

export function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [preset, setPreset] = useState('medium');
  const [resolution, setResolution] = useState('original');
  const [removeAudio, setRemoveAudio] = useState(false);
  const [customCrf, setCustomCrf] = useState(23);
  const [useCustomCrf, setUseCustomCrf] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // 预加载 FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      setIsLoading(true);
      try {
        await getFFmpeg();
        setFfmpegLoaded(true);
        setError(null);
      } catch (err) {
        console.error('FFmpeg 加载失败:', err);
        setError(
          'FFmpeg 加载失败，请检查网络连接后刷新页面重试。如果问题持续，请尝试使用 Chrome 或 Edge 浏览器。'
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadFFmpeg();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      setResult(null);
      setError(null);
      setProgress(0);

      try {
        const info = await getVideoInfo(videoFile);
        setVideoInfo(info);
      } catch {
        setError('无法读取视频信息');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.wmv', '.flv'],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const handleCompress = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsCompressing(true);
    setProgress(0);
    setError(null);

    try {
      const ffmpeg = await getFFmpeg();

      // 监听进度
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      // 写入输入文件
      const inputExt = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${inputExt}`;
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // 构建压缩命令
      const args = ['-i', inputName];

      // 视频编码设置
      args.push('-c:v', 'libx264');

      // 预设或自定义 CRF
      const selectedPreset = compressionPresets.find((p) => p.value === preset);
      args.push('-preset', preset);
      args.push('-crf', String(useCustomCrf ? customCrf : selectedPreset?.crf || 23));

      // 分辨率调整
      const selectedResolution = resolutionPresets.find((r) => r.value === resolution);
      if (selectedResolution && selectedResolution.width > 0) {
        args.push('-vf', `scale=${selectedResolution.width}:-2`);
      }

      // 音频设置
      if (removeAudio) {
        args.push('-an');
      } else {
        args.push('-c:a', 'aac', '-b:a', '128k');
      }

      // 其他优化
      args.push('-movflags', '+faststart');
      args.push('-y', outputName);

      // 执行压缩
      await ffmpeg.exec(args);

      // 读取输出文件
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data instanceof Uint8Array ? new Uint8Array(data) : data], { type: 'video/mp4' });

      // 生成文件名
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_compressed.mp4`;

      setResult({
        original: file,
        compressed: blob,
        originalSize: file.size,
        compressedSize: blob.size,
        url: URL.createObjectURL(blob),
        filename,
      });

      // 清理临时文件
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error('压缩失败:', err);
      setError('视频压缩失败，请检查视频文件或尝试其他设置');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    a.click();
  };

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setVideoInfo(null);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  // 计算压缩比例
  const compressionRatio =
    result && result.originalSize > result.compressedSize
      ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
      : 0;

  // Cleanup
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shrink className="w-7 h-7" />
            视频压缩
          </h1>
          <p className="text-muted-foreground">智能压缩视频大小，保持最佳画质，本地处理更安全</p>
        </div>
        {file && (
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新开始
          </Button>
        )}
      </div>

      {/* Loading FFmpeg */}
      {isLoading && (
        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          <p className="font-medium">正在加载视频处理引擎...</p>
          <p className="text-sm text-muted-foreground mt-1">首次加载可能需要几秒钟</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">错误</p>
            <p className="text-sm text-destructive/80 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {ffmpegLoaded && !isLoading && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">选择视频</CardTitle>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">拖拽或点击上传视频</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      支持 MP4, WebM, MOV, AVI, MKV 等格式（最大 500MB）
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoPreviewRef}
                        src={URL.createObjectURL(file)}
                        controls
                        className="w-full max-h-[300px]"
                      />
                    </div>

                    {/* Video Info */}
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <FileVideo className="w-10 h-10 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          {videoInfo && (
                            <>
                              <span>
                                {videoInfo.width}×{videoInfo.height}
                              </span>
                              <span>{formatDuration(videoInfo.duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleReset}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compressing Progress */}
            {isCompressing && (
              <Card>
                <CardContent className="py-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        正在压缩...
                      </span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground text-center">
                      视频处理中，请勿关闭页面
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result */}
            {result && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      压缩完成
                    </CardTitle>
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      下载视频
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <video src={result.url} controls className="w-full rounded-lg max-h-[300px]" />

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-muted-foreground">原始大小</p>
                        <p className="font-medium">{formatFileSize(result.originalSize)}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-muted-foreground">压缩后</p>
                        <p className="font-medium">{formatFileSize(result.compressedSize)}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg text-center">
                        <p className="text-muted-foreground">节省</p>
                        <p className="font-medium text-green-600">
                          {compressionRatio > 0 ? `-${compressionRatio}%` : '已优化'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  压缩设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 压缩预设 */}
                <div className="space-y-2">
                  <Label>压缩预设</Label>
                  <Select value={preset} onValueChange={setPreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {compressionPresets.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">速度越慢，压缩质量越高</p>
                </div>

                {/* 自定义质量 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>自定义质量 (CRF)</Label>
                    <Switch checked={useCustomCrf} onCheckedChange={setUseCustomCrf} />
                  </div>
                  {useCustomCrf && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>高质量</span>
                        <span>{customCrf}</span>
                        <span>高压缩</span>
                      </div>
                      <Slider
                        min={18}
                        max={35}
                        step={1}
                        value={[customCrf]}
                        onValueChange={([v]) => setCustomCrf(v)}
                      />
                    </div>
                  )}
                </div>

                {/* 分辨率 */}
                <div className="space-y-2">
                  <Label>输出分辨率</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutionPresets.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 移除音频 */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-audio">移除音频</Label>
                  <Switch
                    id="remove-audio"
                    checked={removeAudio}
                    onCheckedChange={setRemoveAudio}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCompress}
                  disabled={!file || isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      压缩中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      开始压缩
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">压缩建议</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 一般视频选择「平衡」预设即可</li>
                  <li>• 降低分辨率可大幅减少文件大小</li>
                  <li>• 移除音频适合制作无声视频/GIF</li>
                  <li>• CRF 值越小画质越好，体积越大</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <p className="text-sm">
                  <strong>🔒 隐私保护</strong>
                  <br />
                  所有视频处理在浏览器本地完成，不会上传到服务器
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
