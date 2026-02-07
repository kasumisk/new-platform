'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { generateImage, type ImageGenerationResponse } from '@/lib/api/gateway-client';
import { Loader2, Wand2, AlertCircle, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const MODELS = [
  { value: 'dall-e-2', label: 'DALL-E 2' },
  { value: 'dall-e-3', label: 'DALL-E 3' },
  { value: 'wanx-v1', label: 'Wanx V1' },
];

const DALL_E_2_SIZES = [
  { value: '256x256', label: '256x256' },
  { value: '512x512', label: '512x512' },
  { value: '1024x1024', label: '1024x1024' },
];

const DALL_E_3_SIZES = [
  { value: '1024x1024', label: '1024x1024' },
  { value: '1024x1792', label: '1024x1792 (竖版)' },
  { value: '1792x1024', label: '1792x1024 (横版)' },
];

const WANX_SIZES = [
  { value: '1024*1024', label: '1024x1024' },
  { value: '720*1280', label: '720x1280 (竖版)' },
  { value: '1280*720', label: '1280x720 (横版)' },
];

const QUALITIES = [
  { value: 'standard', label: '标准' },
  { value: 'hd', label: '高清 (仅 DALL-E 3)' },
];

export function ImageGenerationTest() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e-3');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [n, setN] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ImageGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSizeOptions = () => {
    if (model === 'dall-e-2') return DALL_E_2_SIZES;
    if (model === 'dall-e-3') return DALL_E_3_SIZES;
    return WANX_SIZES;
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    // 重置尺寸为第一个可用选项
    const sizeOptions =
      newModel === 'dall-e-2'
        ? DALL_E_2_SIZES
        : newModel === 'dall-e-3'
          ? DALL_E_3_SIZES
          : WANX_SIZES;
    setSize(sizeOptions[0].value);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('请输入图像描述');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const result = await generateImage({
      model,
      prompt,
      size,
      quality: model === 'dall-e-3' ? quality : undefined,
      n,
    });

    setIsLoading(false);

    if (result.success && result.data) {
      setResponse(result.data);
    } else {
      setError(result.message || '请求失败');
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `image-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 配置区 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="model">模型</Label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">图像尺寸</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger id="size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getSizeOptions().map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {model === 'dall-e-3' && (
          <div className="space-y-2">
            <Label htmlFor="quality">图像质量</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger id="quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITIES.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {model === 'dall-e-2' && (
          <div className="space-y-2">
            <Label htmlFor="n">生成数量 (1-10)</Label>
            <Select value={n.toString()} onValueChange={(v) => setN(parseInt(v))}>
              <SelectTrigger id="n">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} 张
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 提示词 */}
      <div className="space-y-2">
        <Label htmlFor="prompt">图像描述</Label>
        <Textarea
          id="prompt"
          placeholder="详细描述您想要生成的图像，例如：A serene landscape with mountains and a lake at sunset, digital art style..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          提示：使用详细的英文描述可以获得更好的效果。建议包含风格、色彩、构图等细节。
        </p>
      </div>

      {/* 提交按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            生成中，请稍候...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            生成图像
          </>
        )}
      </Button>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 生成结果 */}
      {response && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 font-semibold">生成的图像</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {response.images.map((image, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border bg-muted"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.revisedPrompt || prompt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* 操作按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image.url, index)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        下载
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.url, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        查看
                      </Button>
                    </div>

                    {/* 修订后的提示词 */}
                    {image.revisedPrompt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="line-clamp-2 text-xs text-white">{image.revisedPrompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">生成信息</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">模型</div>
                  <div className="font-mono text-sm font-medium">{response.model}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">数量</div>
                  <div className="font-mono text-sm font-medium">{response.images.length} 张</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">Request ID</div>
                  <div className="truncate font-mono text-xs">{response.requestId}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">费用信息</h3>
              <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{response.cost.amount.toFixed(6)}</span>
                  <span className="text-lg text-muted-foreground">{response.cost.currency}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  平均每张: {(response.cost.amount / response.images.length).toFixed(6)}{' '}
                  {response.cost.currency}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 定价说明 */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>定价参考：</strong>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
            <li>DALL-E 2: $0.016-0.020/张（根据尺寸）</li>
            <li>DALL-E 3: $0.040-0.120/张（根据尺寸和质量）</li>
            <li>Wanx: ¥0.08/张</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
