'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
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
  Video,
  X,
  RefreshCw,
  Loader2,
  FileVideo,
  CheckCircle,
  Settings2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getFFmpeg,
  fetchFile,
  videoFormats,
  formatFileSize,
  formatDuration,
  getVideoInfo,
} from '@/lib/ffmpeg';

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

interface ConvertedVideo {
  original: File;
  converted: Blob;
  originalSize: number;
  convertedSize: number;
  url: string;
  filename: string;
  format: string;
}

export function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [isConverting, setIsConverting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConvertedVideo | null>(null);
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

  const handleConvert = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const ffmpeg = await getFFmpeg();

      // 监听进度
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      // 写入输入文件
      const inputName = `input.${file.name.split('.').pop()}`;
      const outputName = `output.${targetFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // 构建转换命令
      const args = ['-i', inputName];

      // 根据格式选择编码器
      if (targetFormat === 'mp4') {
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
        args.push('-c:a', 'aac', '-b:a', '128k');
      } else if (targetFormat === 'webm') {
        args.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0');
        args.push('-c:a', 'libopus', '-b:a', '128k');
      } else if (targetFormat === 'gif') {
        args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos');
        args.push('-loop', '0');
      } else {
        args.push('-c:v', 'copy', '-c:a', 'copy');
      }

      args.push('-y', outputName);

      // 执行转换
      await ffmpeg.exec(args);

      // 读取输出文件
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data instanceof Uint8Array ? new Uint8Array(data) : data], {
        type: videoFormats.find((f) => f.value === targetFormat)?.mimeType || 'video/mp4',
      });

      // 生成文件名
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}.${targetFormat}`;

      setResult({
        original: file,
        converted: blob,
        originalSize: file.size,
        convertedSize: blob.size,
        url: URL.createObjectURL(blob),
        filename,
        format: targetFormat,
      });

      // 清理临时文件
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error('转换失败:', err);
      setError('视频转换失败，请尝试其他格式或检查视频文件');
    } finally {
      setIsConverting(false);
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
            <Video className="w-7 h-7" />
            视频格式转换
          </h1>
          <p className="text-muted-foreground">
            支持 MP4、WebM、MOV、AVI 等格式互转，浏览器本地处理
          </p>
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
          {/* Left: Upload & Settings */}
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

            {/* Converting Progress */}
            {isConverting && (
              <Card>
                <CardContent className="py-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        正在转换...
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
                      转换完成
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">原始大小</p>
                        <p className="font-medium">{formatFileSize(result.originalSize)}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground">转换后大小</p>
                        <p className="font-medium">{formatFileSize(result.convertedSize)}</p>
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
                  转换设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>目标格式</Label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{format.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format.desc}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConvert}
                  disabled={!file || isConverting}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      转换中...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      开始转换
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">格式说明</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>MP4</strong> - 兼容性最好，推荐使用
                  </li>
                  <li>
                    <strong>WebM</strong> - 网页优化，体积更小
                  </li>
                  <li>
                    <strong>GIF</strong> - 转换为动图格式
                  </li>
                  <li>
                    <strong>MOV</strong> - Apple 设备兼容
                  </li>
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
